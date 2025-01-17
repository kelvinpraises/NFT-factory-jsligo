import { InMemorySigner } from '@taquito/signer';
import { TezosToolkit, MichelsonMap } from '@taquito/taquito';
import factory from '../compiled/factory.json';
import * as dotenv from 'dotenv'

dotenv.config(({ path: __dirname + '/.env' }))

const rpc = process.env.RPC;
const pk: string = process.env.ADMIN_PK || undefined;
const Tezos = new TezosToolkit(rpc);
const signer = new InMemorySigner(pk);
Tezos.setProvider({ signer: signer })

let factory_address = process.env.FACTORY_CONTRACT_ADDRESS || undefined;

async function orig() {

    let factory_store = {
        'allCollections': new MichelsonMap(),
        'ownedCollections': new MichelsonMap(),
        'metadata': new MichelsonMap(),
    }

    try {
        // Originate an Factory contract
        if (factory_address === undefined) {
            const factory_originated = await Tezos.contract.originate({
                code: factory,
                storage: factory_store,
            })
            console.log(`Waiting for FACTORY ${factory_originated.contractAddress} to be confirmed...`);
            await factory_originated.confirmation(2);
            console.log('confirmed FACTORY: ', factory_originated.contractAddress);
            factory_address = factory_originated.contractAddress;
        }

        console.log("./tezos-client remember contract FACTORY", factory_address)

    } catch (error: any) {
        console.log(error)
        return process.exit(1)
    }
}

orig();
