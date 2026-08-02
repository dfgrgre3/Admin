/**
 * Compatibility wrapper: re-export the main Broadcast modal.
 * Keeps old imports working while pointing to the real implementation.
 */
import { BroadcastModal } from "../broadcast/broadcast-modal";
export default BroadcastModal;
export { BroadcastModal, BroadcastModal as RoyalMessageModal };
export type { UserModel } from "../broadcast/types";
