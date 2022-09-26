import {altair} from "@lodestar/types";
import {IChainForkConfig} from "@lodestar/config";
import {computeTimeAtSlot} from "@lodestar/state-transition";
import {IBeaconChain} from "../interface.js";
import {LightClientError, LightClientErrorCode} from "../errors/lightClientError.js";
import {GossipAction} from "../errors/index.js";

// https://github.com/ethereum/consensus-specs/blob/dev/specs/altair/light-client/p2p-interface.md#light_client_optimistic_update
export async function validateLightClientOptimisticUpdate(
  config: IChainForkConfig,
  chain: IBeaconChain,
  lightClientOptimisticUpdate: altair.LightClientOptimisticUpdate
): Promise<void> {
  // [IGNORE] No other optimistic_update with a lower or equal attested_header.slot was already forwarded on the network
  const gossipedAttestedSlot = lightClientOptimisticUpdate.attestedHeader.slot;
  const latestForwardedOptimisticSlot = chain.lightClientServer.latestForwardedOptimisticSlot;

  if (latestForwardedOptimisticSlot != null && gossipedAttestedSlot <= latestForwardedOptimisticSlot) {
    throw new LightClientError(GossipAction.IGNORE, {
      code: LightClientErrorCode.OPTIMISTIC_UPDATE_ALREADY_FORWARDED,
    });
  }

  // [IGNORE] The optimistic_update is received after the block at signature_slot was given enough time to propagate
  // through the network -- i.e. validate that one-third of optimistic_update.signature_slot has transpired
  // (SECONDS_PER_SLOT / INTERVALS_PER_SLOT seconds after the start of the slot, with a MAXIMUM_GOSSIP_CLOCK_DISPARITY allowance)
  const signatureSlot = lightClientOptimisticUpdate.signatureSlot;
  const timeAtSignatureSlot = computeTimeAtSlot(config, signatureSlot, chain.genesisTime);
  const currentSlotWithGossipDisparity = chain.clock.currentSlotWithGossipDisparity;
  if (currentSlotWithGossipDisparity < timeAtSignatureSlot) {
    throw new LightClientError(GossipAction.IGNORE, {
      code: LightClientErrorCode.OPTIMISTIC_UPDATE_RECEIVED_TOO_EARLY,
    });
  }

  // [IGNORE] The received optimistic_update matches the locally computed one exactly
  if (lightClientOptimisticUpdate != (await chain.lightClientServer.getOptimisticUpdate())) {
    throw new LightClientError(GossipAction.IGNORE, {
      code: LightClientErrorCode.OPTIMISTIC_UPDATE_NOT_MATCHING_LOCAL,
    });
  }

  chain.lightClientServer.latestForwardedOptimisticSlot = lightClientOptimisticUpdate.attestedHeader.slot;
}