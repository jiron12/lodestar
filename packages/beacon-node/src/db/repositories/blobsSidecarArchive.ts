import {IChainForkConfig} from "@lodestar/config";
import {Db, Repository, IKeyValue, IFilterOptions, Bucket} from "@lodestar/db";
import {Slot, Root, ssz, eip4844} from "@lodestar/types";
import {bytesToInt} from "@lodestar/utils";

export interface IBlockFilterOptions extends IFilterOptions<Slot> {
  step?: number;
}

export type BlockArchiveBatchPutBinaryItem = IKeyValue<Slot, Uint8Array> & {
  slot: Slot;
  blockRoot: Root;
  parentRoot: Root;
};

/**
 * Stores finalized blocks. Block slot is identifier.
 */
export class BlobsSidecarArchiveRepository extends Repository<Slot, eip4844.BlobsSidecar> {
  constructor(config: IChainForkConfig, db: Db) {
    super(config, db, Bucket.allForks_blobsSidecarArchive, ssz.eip4844.BlobsSidecar);
  }

  // Handle key as slot

  getId(value: eip4844.BlobsSidecar): Slot {
    return value.beaconBlockSlot;
  }

  decodeKey(data: Uint8Array): number {
    return bytesToInt((super.decodeKey(data) as unknown) as Uint8Array, "be");
  }
}
