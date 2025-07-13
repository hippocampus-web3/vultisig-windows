import { queryUrl } from '@lib/utils/query/queryUrl'
import { withoutUndefinedFields } from '@lib/utils/record/withoutUndefinedFields'

type DeleteRelayMessageInput = {
  serverUrl: string
  localPartyId: string
  sessionId: string
  messageHash: string
  messageId?: string
}

export const deleteRelayMessage = async ({
  serverUrl,
  localPartyId,
  sessionId,
  messageHash,
  messageId,
}: DeleteRelayMessageInput) =>
  queryUrl(`${serverUrl}/message/${sessionId}/${localPartyId}/${messageHash}`, {
    method: 'DELETE',
    headers: withoutUndefinedFields({
      'Content-Type': 'application/json',
      message_id: messageId,
    }),
    responseType: 'none',
  })
