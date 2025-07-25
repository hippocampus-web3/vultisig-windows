// @generated by protoc-gen-es v2.4.0 with parameter "target=ts"
// @generated from file vultisig/vault/v1/vault_container.proto (package vultisig.vault.v1, syntax proto3)
/* eslint-disable */

import type { GenFile, GenMessage } from '@bufbuild/protobuf/codegenv1'
import { fileDesc, messageDesc } from '@bufbuild/protobuf/codegenv1'
import type { Message } from '@bufbuild/protobuf'

/**
 * Describes the file vultisig/vault/v1/vault_container.proto.
 */
export const file_vultisig_vault_v1_vault_container: GenFile =
  /*@__PURE__*/
  fileDesc(
    'Cid2dWx0aXNpZy92YXVsdC92MS92YXVsdF9jb250YWluZXIucHJvdG8SEXZ1bHRpc2lnLnZhdWx0LnYxIkYKDlZhdWx0Q29udGFpbmVyEg8KB3ZlcnNpb24YASABKAQSDQoFdmF1bHQYAiABKAkSFAoMaXNfZW5jcnlwdGVkGAMgASgIQlAKEXZ1bHRpc2lnLnZhdWx0LnYxWjZnaXRodWIuY29tL3Z1bHRpc2lnL2NvbW1vbmRhdGEvZ28vdnVsdGlzaWcvdmF1bHQvdjE7djG6AgJWU2IGcHJvdG8z'
  )

/**
 * @generated from message vultisig.vault.v1.VaultContainer
 */
export type VaultContainer = Message<'vultisig.vault.v1.VaultContainer'> & {
  /**
   * version of data format
   *
   * @generated from field: uint64 version = 1;
   */
  version: bigint

  /**
   * vault contained the container
   *
   * @generated from field: string vault = 2;
   */
  vault: string

  /**
   * is vault encrypted with password
   *
   * @generated from field: bool is_encrypted = 3;
   */
  isEncrypted: boolean
}

/**
 * Describes the message vultisig.vault.v1.VaultContainer.
 * Use `create(VaultContainerSchema)` to create a new message.
 */
export const VaultContainerSchema: GenMessage<VaultContainer> =
  /*@__PURE__*/
  messageDesc(file_vultisig_vault_v1_vault_container, 0)
