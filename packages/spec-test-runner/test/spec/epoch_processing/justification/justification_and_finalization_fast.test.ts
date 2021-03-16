import {phase0} from "@chainsafe/lodestar-beacon-state-transition";
import {config} from "@chainsafe/lodestar-config/mainnet";
import {describeDirectorySpecTest, InputType} from "@chainsafe/lodestar-spec-test-util";
import {TreeBacked} from "@chainsafe/ssz";
import {expect} from "chai";
import {join} from "path";
import {SPEC_TEST_LOCATION} from "../../../utils/specTestCases";
import {IStateTestCase} from "../../../utils/specTestTypes/stateTestCase";

describeDirectorySpecTest<IStateTestCase, phase0.BeaconState>(
  "epoch justification and finalization mainnet",
  join(SPEC_TEST_LOCATION, "tests/mainnet/phase0/epoch_processing/justification_and_finalization/pyspec_tests"),
  (testcase) => {
    const wrappedState = phase0.fast.createCachedBeaconState<phase0.BeaconState>(
      config,
      testcase.pre as TreeBacked<phase0.BeaconState>
    );
    const process = phase0.fast.prepareEpochProcessState(wrappedState);
    phase0.fast.processJustificationAndFinalization(wrappedState, process);
    return wrappedState;
  },
  {
    inputTypes: {
      pre: {
        type: InputType.SSZ,
        treeBacked: true,
      },
      post: {
        type: InputType.SSZ,
        treeBacked: true,
      },
    },
    sszTypes: {
      pre: config.types.phase0.BeaconState,
      post: config.types.phase0.BeaconState,
    },
    getExpected: (testCase) => testCase.post,
    expectFunc: (testCase, expected, actual) => {
      expect(config.types.phase0.BeaconState.equals(actual, expected)).to.be.true;
    },
  }
);
