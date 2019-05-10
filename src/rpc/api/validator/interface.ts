/**
 * @module rpc/api
 */

import {
  Attestation,
  AttestationData,
  BeaconBlock,
  bytes,
  bytes32,
  bytes48,
  Epoch,
  Fork,
  number64,
  Shard,
  Slot,
  SyncingStatus,
  ValidatorDuty,
  ValidatorIndex
} from "../../../types";
import {IApi} from "../interface";
import {CommitteeAssignment} from "../../../validator/types";

/**
 * The API interface defines the calls that can be made from a Validator
 */
export interface IValidatorApi extends IApi {

  /**
   * Requests the BeaconNode to provide a set of “duties”, which are actions that should be performed by ValidatorClients. This API call should be polled at every slot, to ensure that any chain reorganisations are catered for, and to ensure that the currently connected BeaconNode is properly synchronised.
   * @returns A list of unique validator public keys, where each item is a 0x encoded hex string.
   */
  getDuties(validatorPubkey: bytes48): Promise<{currentVersion: Fork; validatorDuty: ValidatorDuty}>;

  /**
   * Requests to check if a validator should propose for a given slot.
   */
  isProposer(index: ValidatorIndex, slot: Slot): Promise<boolean>;

  /**
   * Requests a validators committeeAssignment, can be used for past, current and one epoch in the future
   */
  getCommitteeAssignment(index: ValidatorIndex, epoch: Epoch): Promise<CommitteeAssignment>;

  /**
   * Requests a BeaconNode to produce a valid block, which can then be signed by a ValidatorClient.
   * @returns A proposed BeaconBlock object, but with the signature field left blank.
   */
  produceBlock(slot: Slot, randaoReveal: bytes): Promise<BeaconBlock>;

  /**
   * Requests that the BeaconNode produce an IndexedAttestation, with a blank signature field, which the ValidatorClient will then sign.
   */
  produceAttestation(slot: Slot, shard: Shard): Promise<AttestationData>;

  /**
   * Instructs the BeaconNode to publish a newly signed beacon block to the beacon network, to be included in the beacon chain.
   */
  publishBlock(beaconBlock: BeaconBlock): Promise<void>;

  /**
   * Instructs the BeaconNode to publish a newly signed IndexedAttestation object, to be incorporated into the beacon chain.
   */
  publishAttestation(attestation: Attestation): Promise<void>;
}
