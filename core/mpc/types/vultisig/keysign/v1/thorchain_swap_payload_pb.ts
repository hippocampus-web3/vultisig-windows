// @generated by protoc-gen-es v2.4.0 with parameter "target=ts"
// @generated from file vultisig/keysign/v1/thorchain_swap_payload.proto (package vultisig.keysign.v1, syntax proto3)
/* eslint-disable */

import type { GenFile, GenMessage } from '@bufbuild/protobuf/codegenv1'
import { fileDesc, messageDesc } from '@bufbuild/protobuf/codegenv1'
import type { Coin } from './coin_pb'
import { file_vultisig_keysign_v1_coin } from './coin_pb'
import type { Message } from '@bufbuild/protobuf'

/**
 * Describes the file vultisig/keysign/v1/thorchain_swap_payload.proto.
 */
export const file_vultisig_keysign_v1_thorchain_swap_payload: GenFile =
  /*@__PURE__*/
  fileDesc(
    'CjB2dWx0aXNpZy9rZXlzaWduL3YxL3Rob3JjaGFpbl9zd2FwX3BheWxvYWQucHJvdG8SE3Z1bHRpc2lnLmtleXNpZ24udjEiigMKFFRIT1JDaGFpblN3YXBQYXlsb2FkEhQKDGZyb21fYWRkcmVzcxgBIAEoCRIsCglmcm9tX2NvaW4YAiABKAsyGS52dWx0aXNpZy5rZXlzaWduLnYxLkNvaW4SKgoHdG9fY29pbhgDIAEoCzIZLnZ1bHRpc2lnLmtleXNpZ24udjEuQ29pbhIVCg12YXVsdF9hZGRyZXNzGAQgASgJEhsKDnJvdXRlcl9hZGRyZXNzGAUgASgJSACIAQESEwoLZnJvbV9hbW91bnQYBiABKAkSGQoRdG9fYW1vdW50X2RlY2ltYWwYByABKAkSFwoPdG9fYW1vdW50X2xpbWl0GAggASgJEhoKEnN0cmVhbWluZ19pbnRlcnZhbBgJIAEoCRIaChJzdHJlYW1pbmdfcXVhbnRpdHkYCiABKAkSFwoPZXhwaXJhdGlvbl90aW1lGAsgASgEEhQKDGlzX2FmZmlsaWF0ZRgMIAEoCBILCgNmZWUYDSABKAlCEQoPX3JvdXRlcl9hZGRyZXNzQlQKE3Z1bHRpc2lnLmtleXNpZ24udjFaOGdpdGh1Yi5jb20vdnVsdGlzaWcvY29tbW9uZGF0YS9nby92dWx0aXNpZy9rZXlzaWduL3YxO3YxugICVlNiBnByb3RvMw',
    [file_vultisig_keysign_v1_coin]
  )

/**
 * @generated from message vultisig.keysign.v1.THORChainSwapPayload
 */
export type THORChainSwapPayload =
  Message<'vultisig.keysign.v1.THORChainSwapPayload'> & {
    /**
     * @generated from field: string from_address = 1;
     */
    fromAddress: string

    /**
     * @generated from field: vultisig.keysign.v1.Coin from_coin = 2;
     */
    fromCoin?: Coin

    /**
     * @generated from field: vultisig.keysign.v1.Coin to_coin = 3;
     */
    toCoin?: Coin

    /**
     * @generated from field: string vault_address = 4;
     */
    vaultAddress: string

    /**
     * @generated from field: optional string router_address = 5;
     */
    routerAddress?: string

    /**
     * @generated from field: string from_amount = 6;
     */
    fromAmount: string

    /**
     * @generated from field: string to_amount_decimal = 7;
     */
    toAmountDecimal: string

    /**
     * @generated from field: string to_amount_limit = 8;
     */
    toAmountLimit: string

    /**
     * @generated from field: string streaming_interval = 9;
     */
    streamingInterval: string

    /**
     * @generated from field: string streaming_quantity = 10;
     */
    streamingQuantity: string

    /**
     * @generated from field: uint64 expiration_time = 11;
     */
    expirationTime: bigint

    /**
     * @generated from field: bool is_affiliate = 12;
     */
    isAffiliate: boolean

    /**
     * @generated from field: string fee = 13;
     */
    fee: string
  }

/**
 * Describes the message vultisig.keysign.v1.THORChainSwapPayload.
 * Use `create(THORChainSwapPayloadSchema)` to create a new message.
 */
export const THORChainSwapPayloadSchema: GenMessage<THORChainSwapPayload> =
  /*@__PURE__*/
  messageDesc(file_vultisig_keysign_v1_thorchain_swap_payload, 0)
