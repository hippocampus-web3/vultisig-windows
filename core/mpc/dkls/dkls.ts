import { base64Encode } from '@lib/utils/base64Encode'

import { KeygenSession, Keyshare, QcSession } from '../../../lib/dkls/vs_wasm'
import { getKeygenThreshold } from '../getKeygenThreshold'
import { getMessageHash } from '../getMessageHash'
import { KeygenOperation } from '../keygen/KeygenOperation'
import { initializeMpcLib } from '../lib/initialize'
import { MpcRelayMessage } from '../message/relay'
import { deleteMpcRelayMessage } from '../message/relay/delete'
import { getMpcRelayMessages } from '../message/relay/get'
import { sendMpcRelayMessage } from '../message/relay/send'
import { fromMpcServerMessage, toMpcServerMessage } from '../message/server'
import { waitForSetupMessage } from '../message/setup/get'
import { uploadMpcSetupMessage } from '../message/setup/upload'
import { combineReshareCommittee } from '../reshareCommittee'
import { sleep } from '../sleep'

export class DKLS {
  private readonly keygenOperation: KeygenOperation
  private readonly isInitiateDevice: boolean
  private readonly serverURL: string
  private readonly sessionId: string
  private readonly localPartyId: string
  private readonly keygenCommittee: string[]
  private readonly oldKeygenCommittee: string[]
  private readonly hexEncryptionKey: string
  private isKeygenComplete: boolean = false
  private sequenceNo: number = 0
  private cache: Record<string, string> = {}
  private setupMessage: Uint8Array = new Uint8Array()
  private readonly localUI?: string
  private readonly publicKey?: string
  private readonly chainCode?: string
  constructor(
    keygenOperation: KeygenOperation,
    isInitiateDevice: boolean,
    serverURL: string,
    sessionId: string,
    localPartyId: string,
    keygenCommittee: string[],
    oldKeygenCommittee: string[],
    hexEncryptionKey: string,
    localUI?: string,
    publicKey?: string,
    chainCode?: string
  ) {
    this.keygenOperation = keygenOperation
    this.isInitiateDevice = isInitiateDevice
    this.serverURL = serverURL
    this.sessionId = sessionId
    this.localPartyId = localPartyId
    this.keygenCommittee = keygenCommittee
    this.oldKeygenCommittee = oldKeygenCommittee
    this.hexEncryptionKey = hexEncryptionKey
    this.publicKey = publicKey
    this.chainCode = chainCode
    this.localUI = localUI?.padEnd(64, '0')
  }

  private async processOutbound(session: KeygenSession | QcSession) {
    console.log('processOutbound')
    while (true) {
      try {
        const message = session.outputMessage()
        if (message === undefined) {
          if (this.isKeygenComplete) {
            console.log('stop processOutbound')
            return
          } else {
            await sleep(100) // backoff for 100ms
          }
          continue
        }
        console.log('outbound message:', message)
        const body = toMpcServerMessage(message.body, this.hexEncryptionKey)

        message?.receivers.forEach(receiver => {
          const relayMessage: MpcRelayMessage = {
            session_id: this.sessionId,
            from: this.localPartyId,
            to: [receiver],
            body: body,
            hash: getMessageHash(base64Encode(message.body)),
            sequence_no: this.sequenceNo,
          }
          // send message to receiver
          sendMpcRelayMessage({
            serverUrl: this.serverURL,
            message: relayMessage,
            sessionId: this.sessionId,
          })
          this.sequenceNo++
        })
      } catch (error) {
        console.error('processOutbound error:', error)
      }
    }
  }

  private async processInbound(session: KeygenSession | QcSession) {
    const start = Date.now()
    while (true) {
      try {
        const parsedMessages = await getMpcRelayMessages({
          serverUrl: this.serverURL,
          localPartyId: this.localPartyId,
          sessionId: this.sessionId,
        })
        if (parsedMessages.length === 0) {
          // no message to download, backoff for 100ms
          await sleep(100)
          continue
        }
        for (const msg of parsedMessages) {
          const cacheKey = `${msg.session_id}-${msg.from}-${msg.hash}`
          if (this.cache[cacheKey]) {
            continue
          }
          console.log(
            `got message from: ${msg.from},to: ${msg.to},key:${cacheKey}`
          )
          const decryptedMessage = fromMpcServerMessage(
            msg.body,
            this.hexEncryptionKey
          )
          const isFinish = session.inputMessage(decryptedMessage)
          if (isFinish) {
            await sleep(1000) // wait for 1 second to make sure all messages are processed
            this.isKeygenComplete = true
            console.log('keygen complete')
            return true
          }
          this.cache[cacheKey] = ''
          await deleteMpcRelayMessage({
            serverUrl: this.serverURL,
            localPartyId: this.localPartyId,
            sessionId: this.sessionId,
            messageHash: msg.hash,
          })
        }
        const end = Date.now()
        // timeout after 1 minute
        if (end - start > 1000 * 60 * 2) {
          console.log('timeout')
          this.isKeygenComplete = true
          return false
        }
      } catch (error) {
        console.error('processInbound error:', error)
      }
    }
  }

  private async startKeygen(attempt: number) {
    console.log('startKeygen attempt:', attempt)
    console.log('session id:', this.sessionId)
    this.isKeygenComplete = false
    try {
      if (this.isInitiateDevice) {
        const threshold = getKeygenThreshold(this.keygenCommittee.length)
        this.setupMessage = KeygenSession.setup(
          undefined,
          threshold,
          this.keygenCommittee
        )
        // upload setup message to server
        const encryptedSetupMsg = toMpcServerMessage(
          this.setupMessage,
          this.hexEncryptionKey
        )

        await uploadMpcSetupMessage({
          serverUrl: this.serverURL,
          message: encryptedSetupMsg,
          sessionId: this.sessionId,
        })
        console.log('uploaded setup message successfully')
      } else {
        const encodedEncryptedSetupMsg = await waitForSetupMessage({
          serverUrl: this.serverURL,
          sessionId: this.sessionId,
        })
        this.setupMessage = fromMpcServerMessage(
          encodedEncryptedSetupMsg,
          this.hexEncryptionKey
        )
      }
      let session: KeygenSession
      if ('create' in this.keygenOperation) {
        session = new KeygenSession(this.setupMessage, this.localPartyId)
      } else if (
        'reshare' in this.keygenOperation &&
        this.keygenOperation.reshare === 'migrate'
      ) {
        session = KeygenSession.migrate(
          this.setupMessage,
          this.localPartyId,
          Buffer.from(this.localUI || '', 'hex'),
          Buffer.from(this.publicKey || '', 'hex'),
          Buffer.from(this.chainCode || '', 'hex')
        )
        console.log('migrate session:', session)
      } else {
        throw new Error('invalid keygen type')
      }

      const outbound = this.processOutbound(session)
      const inbound = this.processInbound(session)
      const [, inboundResult] = await Promise.all([outbound, inbound])
      if (inboundResult) {
        const keyShare = session.finish()
        return {
          keyshare: base64Encode(keyShare.toBytes()),
          publicKey: Buffer.from(keyShare.publicKey()).toString('hex'),
          chaincode: Buffer.from(keyShare.rootChainCode()).toString('hex'),
        }
      }
      throw new Error('DKLS keygen failed')
    } catch (error) {
      if (error instanceof Error) {
        console.error('DKLS keygen error:', error)
        console.error('DKLS keygen error:', error.stack)
      }
      throw error
    }
  }

  public async startKeygenWithRetry() {
    await initializeMpcLib('ecdsa')
    for (let i = 0; i < 3; i++) {
      try {
        const result = await this.startKeygen(i)
        return result
      } catch (error) {
        console.error('DKLS keygen error:', error)
      }
    }
    throw new Error('DKLS keygen failed')
  }
  public getSetupMessage() {
    return this.setupMessage
  }

  private async startReshare(
    dklsKeyshare: string | undefined,
    attempt: number
  ) {
    console.log('startReshare dkls, attempt:', attempt)
    this.isKeygenComplete = false
    let localKeyshare: Keyshare | null = null
    if (dklsKeyshare !== undefined && dklsKeyshare.length > 0) {
      localKeyshare = Keyshare.fromBytes(Buffer.from(dklsKeyshare, 'base64'))
    }
    try {
      let setupMessage: Uint8Array = new Uint8Array()
      if (this.isInitiateDevice) {
        if (localKeyshare === null) {
          throw new Error('local keyshare is null')
        }
        // keygenCommittee only has new committee members
        const threshold = getKeygenThreshold(this.keygenCommittee.length)
        const { allCommittee, newCommitteeIdx, oldCommitteeIdx } =
          combineReshareCommittee({
            keygenCommittee: this.keygenCommittee,
            oldKeygenCommittee: this.oldKeygenCommittee,
          })
        const newCommitteeIdxUint8 = new Uint8Array(newCommitteeIdx)
        const oldCommitteeIdxUint8 = new Uint8Array(oldCommitteeIdx)
        setupMessage = QcSession.setup(
          localKeyshare,
          allCommittee,
          oldCommitteeIdxUint8,
          threshold,
          newCommitteeIdxUint8
        )
        // upload setup message to server
        const encryptedSetupMsg = toMpcServerMessage(
          setupMessage,
          this.hexEncryptionKey
        )
        console.log('encrypted setup message:', encryptedSetupMsg)
        await uploadMpcSetupMessage({
          serverUrl: this.serverURL,
          message: encryptedSetupMsg,
          sessionId: this.sessionId,
        })
        console.log('uploaded setup message successfully')
      } else {
        const encodedEncryptedSetupMsg = await waitForSetupMessage({
          serverUrl: this.serverURL,
          sessionId: this.sessionId,
        })
        setupMessage = fromMpcServerMessage(
          encodedEncryptedSetupMsg,
          this.hexEncryptionKey
        )
      }
      const session = new QcSession(
        setupMessage,
        this.localPartyId,
        localKeyshare
      )

      try {
        const outbound = this.processOutbound(session)
        const inbound = this.processInbound(session)
        const [, inboundResult] = await Promise.all([outbound, inbound])
        if (inboundResult) {
          const keyShare = session.finish()
          if (keyShare === undefined) {
            throw new Error('keyshare is null, dkls reshare failed')
          }
          return {
            keyshare: base64Encode(keyShare.toBytes()),
            publicKey: Buffer.from(keyShare.publicKey()).toString('hex'),
            chaincode: Buffer.from(keyShare.rootChainCode()).toString('hex'),
          }
        }
        throw new Error('DKLS reshare failed')
      } finally {
        session.free()
      }
    } catch (error) {
      console.error('DKLS reshare error:', error)
      if (error instanceof Error) {
        console.error('DKLS reshare error:', error.stack)
      }
      throw error
    }
  }

  public async startReshareWithRetry(keyshare: string | undefined) {
    await initializeMpcLib('ecdsa')
    for (let i = 0; i < 3; i++) {
      try {
        const result = await this.startReshare(keyshare, i)
        return result
      } catch (error) {
        console.error('DKLS reshare error:', error)
      }
    }
    throw new Error('DKLS reshare failed')
  }
}
