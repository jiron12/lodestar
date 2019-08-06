/**
 * @module cli/commands
 */

import {CliCommand} from "./interface";
import {PrivateEth1Network} from "../../eth1/dev";
import {CommanderStatic} from "commander";;
import {ILogger, LogLevel, WinstonLogger} from "../../logger";

interface IEth1CommandOptions {
  host: string;
  port: number;
  logLevel: string;
  network: number;
  mnemonic: string;
  database: string;
}

export class Eth1PrivateNetworkCommand implements CliCommand {

  public register(commander: CommanderStatic): void {
    commander
      .command('eth1:dev')
      .description('Start private eth1 chain with deposit contract and 10 accounts with balance')
      .option("-p, --port [port]", 'Port on which private network node should start', 8545)
      .option("-h, --host [host]", 'Host on which node will be', '127.0.0.1')
      .option(`-l, --logLevel [${Object.values(LogLevel).join("|")}]`, "Log level")
      .option("-m, --mnemonic [mnemonic]", 'mnemonic string to be used for generating account')
      .option("-n, --network [networkId]", "Id of eth1 chain", 200)
      .option(
        "-d, --database [database]",
        'Path to database, if specified chain will be initialized from stored point'
      )
      .action(async (options) => {
        try {
          await this.action(options);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(e.message + '\n' + e.stack);
        }
      });
  }

  public async action(options: IEth1CommandOptions): Promise<PrivateEth1Network> {
    const logger: ILogger = new WinstonLogger({
      level: options.logLevel as LogLevel,
      module: "eth1",
    });
    const privateNetwork = new PrivateEth1Network({
      port: options.port,
      host: options.host,
      mnemonic: options.mnemonic,
      networkId: options.network,
      dbPath: options.database,
    }, {logger});
    await privateNetwork.start();
    return privateNetwork;
  }

}
