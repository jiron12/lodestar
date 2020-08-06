import {initBLS} from "@chainsafe/bls";
import {before, after} from "mocha";
import rimraf from "rimraf";
import {rootDir, passphraseFile} from "./constants";

import  ganache from "ganache-core";

const server = ganache.server();

before(async () => {
  await initBLS();
  server.listen(8545);
});

after(async () => {
  server.close();
  await new Promise(resolve => rimraf(rootDir, resolve));
  await new Promise(resolve => rimraf(passphraseFile, resolve));
});