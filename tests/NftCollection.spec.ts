import { Blockchain, SandboxContract, TreasuryContract } from '@ton-community/sandbox';
import { toNano } from 'ton-core';
import { NftCollection } from '../wrappers/NftCollection';
import '@ton-community/test-utils';
import { NftItem } from '../wrappers/NftItem';

describe('NftCollection', () => {
    let blockchain: Blockchain;
    let nftCollection: SandboxContract<NftCollection>;
    let deployer: SandboxContract<TreasuryContract>;
    beforeEach(async () => {
        blockchain = await Blockchain.create();

        nftCollection = blockchain.openContract(await NftCollection.fromInit());

        deployer = await blockchain.treasury('deployer');

        const deployResult = await nftCollection.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: nftCollection.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and nftCollection are ready to use
    });

    it("should mint nft", async()=>{
        
        const res = await nftCollection.send(deployer.getSender(), {
            value: toNano("0.3")
        }, 'Mint')

        console.log(res)

        console.log("deployer - ", deployer.getSender().address)
        console.log("nftCollection - ", nftCollection.address)
        const nftItemAddress = await nftCollection.getGetNftAddressByIndex(0n);
        console.log("nftItemAddress - ", nftItemAddress)
        
        const nftItem: SandboxContract<NftItem> = blockchain.openContract(NftItem.fromAddress(nftItemAddress!))
        
        let nftItemData = await nftItem.getGetItemData();

        console.log("old owner - ", nftItemData.owner)

        const nftCollectionData = await nftCollection.getGetCollectionData()

        console.log(nftCollectionData.collection_content.beginParse().loadStringTail())

        const user = await blockchain.treasury("user");

        await nftItem.send(deployer.getSender(), {
            value: toNano("0.2")
        }, {
            $$type: 'Transfer',
            new_owner: user.address,
            query_id: 0n
        })

        nftItemData = await nftItem.getGetItemData();

        console.log("new owner - ", nftItemData.owner)
    })
});
