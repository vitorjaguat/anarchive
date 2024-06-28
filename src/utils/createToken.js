import { createCreatorClient } from '@zoralabs/protocol-sdk';
import {
  publicClient,
  walletClient,
  chainId,
  creatorAccountPromise,
} from './zoraprotocolConfig';
// import { collectionAddress } from './contract';
import collectionAddress from './dummyCollectionAddress';
import { isAddress, parseEther } from 'viem';
import { SplitV1Client } from '@0xsplits/splits-sdk';

export default async function createToken(
  tokenUri,
  tokenPrice,
  tokenMintingDuration,
  tokenPayoutRecipient
) {
  // parsing tokenMintingDuration:
  // TODO: ask Zora team how this configuration works
  let parsedTokenMintingDuration;
  if (tokenMintingDuration === 'open') {
    parsedTokenMintingDuration = BigInt('18446744073709551615');
  } else if (tokenMintingDuration === '24h') {
    parsedTokenMintingDuration = BigInt('86400');
  } else if (tokenMintingDuration === '1week') {
    parsedTokenMintingDuration = BigInt('604800');
  } else if (tokenMintingDuration === '1month') {
    parsedTokenMintingDuration = BigInt('2592000');
  } else if (tokenMintingDuration === '3months') {
    parsedTokenMintingDuration = BigInt('7776000');
  } else if (tokenMintingDuration === '6months') {
    parsedTokenMintingDuration = BigInt('15552000');
  } else if (tokenMintingDuration === '1year') {
    parsedTokenMintingDuration = BigInt('31536000');
  } else {
    parsedTokenMintingDuration = BigInt('18446744073709551615');
  }
  console.log('parsedTokenMintingDuration: ', parsedTokenMintingDuration);

  // managing payoutRecipient:
  let parsedPayoutRecipient;
  const creatorAccount = await creatorAccountPromise;
  if (tokenPayoutRecipient === 'me') {
    parsedPayoutRecipient = creatorAccount;
  } else if (isAddress(tokenPayoutRecipient)) {
    parsedPayoutRecipient = tokenPayoutRecipient;
  } else if (Array.isArray(tokenPayoutRecipient)) {
    console.log('setting up split');
    // https://docs.zora.co/protocol-sdk/creator/splits
    // setup a splits client
    const splitsClient = new SplitV1Client({
      chainId,
      publicClient,
      apiConfig: {
        // This is a dummy 0xSplits api key, replace with your own
        apiKey: process.env.SPLIT_API_KEY,
      },
    });

    // configure the split:
    const splitsConfig = {
      recipients: tokenPayoutRecipient.map((recipient) => ({
        address: recipient.address,
        percentAllocation: +recipient.percentage,
      })),
      distributorFeePercent: 0,
    };

    // get the deterministic split address, and determine if it has been created or not.
    const predicted = await splitsClient.predictImmutableSplitAddress(
      splitsConfig
    );

    if (!predicted.splitExists) {
      // if the split has not been created, create it by getting the transaction to execute
      // and executing it with the wallet client
      const { data, address } = await splitsClient.callData.createSplit(
        splitsConfig
      );

      await walletClient.sendTransaction({
        to: address,
        account: creatorAccount,
        data,
      });
    }

    parsedPayoutRecipient = predicted.splitAddress;
  }

  console.log('parsedPayoutRecipient: ', parsedPayoutRecipient);

  try {
    // //dinamically importing the zoraprotocolConfig file, so it only runs on client:
    // const { publicClient, walletClient, chainId, creatorAccountPromise } =
    //   typeof window !== 'undefined' ? await import('./zoraprotocolConfig') : {};

    const creatorClient = createCreatorClient({ chainId, publicClient });

    const { parameters } = await creatorClient.create1155({
      // by providing a contract address, the token will be created on an existing contract
      // at that address
      contract: collectionAddress,
      token: {
        // token metadata uri
        tokenMetadataURI: tokenUri,
        maxSupply: BigInt('18446744073709551615'),
        mintToCreatorCount: 1,
        salesConfig: {
          //https://github.com/ourzora/zora-protocol/blob/10d3855fd05ef457c12a978d851886903cddc409/packages/protocol-sdk/src/create/types.ts#L13
          pricePerToken: parseEther(tokenPrice), // defaults to 0, type bigint
          saleStart: BigInt(0), // defaults to 0 (now), in seconds
          saleEnd: parsedTokenMintingDuration, // defaults to forever, in seconds
          maxTokensPerAddress: BigInt(1), // bigint // max tokens that can be minted per address
          // currency:   //type Address, if an erc20 mint, the erc20 address.  Leave null for eth mints
        },
        payoutRecipient: parsedPayoutRecipient,
      },
      // account to execute the transaction (the creator)
      account: creatorAccount,
    });

    // simulate the transaction
    const { request } = await publicClient.simulateContract(parameters);

    // execute the transaction
    const hash = await walletClient.writeContract(request);
    // wait for the response
    const writeResponse = await publicClient.waitForTransactionReceipt({
      hash,
    });

    return { parameters, request, hash, writeResponse };
  } catch (error) {
    console.error('Error:', error);
    return error;
  }
}

// writeResponse:

//request:
// {
//   "abi": [
//       {
//           "stateMutability": "nonpayable",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "data",
//                   "internalType": "bytes[]",
//                   "type": "bytes[]"
//               }
//           ],
//           "name": "multicall",
//           "outputs": [
//               {
//                   "name": "results",
//                   "internalType": "bytes[]",
//                   "type": "bytes[]"
//               }
//           ]
//       }
//   ],
//   "address": "0x8e038a4805d984162028f5978acd894fad310b56",
//   "args": [
//       [
//           "0xe72878b40000000000000000000000000000000000000000000000000000000000000022",
//           "0x674cbae60000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000ffffffffffffffff00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000037697066733a2f2f516d554667437a63364c4d4452504b6e614d694674637976595363773835464a7448574a4c3141757a4c467358392f30000000000000000000",
//           "0x8ec998a0000000000000000000000000000000000000000000000000000000000000002300000000000000000000000004e2516a2c207e84a1839755675dfd8ef6302f0a0000000000000000000000000000000000000000000000000000000000000004",
//           "0xd904b94a000000000000000000000000000000000000000000000000000000000000002300000000000000000000000004e2516a2c207e84a1839755675dfd8ef6302f0a000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000c434db7eee00000000000000000000000000000000000000000000000000000000000000230000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ffffffffffffffff000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000005c6dc3b2a55be4b02e26b75848e27c19df4af9fe00000000000000000000000000000000000000000000000000000000",
//           "0xafed7e9e0000000000000000000000000000000000000000000000000000000000000023000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003e80000000000000000000000005c6dc3b2a55be4b02e26b75848e27c19df4af9fe",
//           "0xc238d1ee0000000000000000000000005c6dc3b2a55be4b02e26b75848e27c19df4af9fe00000000000000000000000000000000000000000000000000000000000000230000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000000000"
//       ]
//   ],
//   "functionName": "multicall",
//   "account": {
//       "address": "0x5C6DC3b2a55be4b02e26b75848e27c19df4Af9fE",
//       "type": "json-rpc"
//   }
// }

//parameters:
// {
//   "abi": [
//       {
//           "stateMutability": "nonpayable",
//           "type": "constructor",
//           "inputs": [
//               {
//                   "name": "_mintFeeRecipient",
//                   "internalType": "address",
//                   "type": "address"
//               },
//               {
//                   "name": "_upgradeGate",
//                   "internalType": "address",
//                   "type": "address"
//               },
//               {
//                   "name": "_protocolRewards",
//                   "internalType": "address",
//                   "type": "address"
//               },
//               {
//                   "name": "_mints",
//                   "internalType": "address",
//                   "type": "address"
//               }
//           ]
//       },
//       {
//           "stateMutability": "payable",
//           "type": "receive"
//       },
//       {
//           "stateMutability": "view",
//           "type": "function",
//           "inputs": [],
//           "name": "CONTRACT_BASE_ID",
//           "outputs": [
//               {
//                   "name": "",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               }
//           ]
//       },
//       {
//           "stateMutability": "view",
//           "type": "function",
//           "inputs": [],
//           "name": "PERMISSION_BIT_ADMIN",
//           "outputs": [
//               {
//                   "name": "",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               }
//           ]
//       },
//       {
//           "stateMutability": "view",
//           "type": "function",
//           "inputs": [],
//           "name": "PERMISSION_BIT_FUNDS_MANAGER",
//           "outputs": [
//               {
//                   "name": "",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               }
//           ]
//       },
//       {
//           "stateMutability": "view",
//           "type": "function",
//           "inputs": [],
//           "name": "PERMISSION_BIT_METADATA",
//           "outputs": [
//               {
//                   "name": "",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               }
//           ]
//       },
//       {
//           "stateMutability": "view",
//           "type": "function",
//           "inputs": [],
//           "name": "PERMISSION_BIT_MINTER",
//           "outputs": [
//               {
//                   "name": "",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               }
//           ]
//       },
//       {
//           "stateMutability": "view",
//           "type": "function",
//           "inputs": [],
//           "name": "PERMISSION_BIT_SALES",
//           "outputs": [
//               {
//                   "name": "",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               }
//           ]
//       },
//       {
//           "stateMutability": "nonpayable",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "tokenId",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               },
//               {
//                   "name": "user",
//                   "internalType": "address",
//                   "type": "address"
//               },
//               {
//                   "name": "permissionBits",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               }
//           ],
//           "name": "addPermission",
//           "outputs": []
//       },
//       {
//           "stateMutability": "nonpayable",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "recipient",
//                   "internalType": "address",
//                   "type": "address"
//               },
//               {
//                   "name": "tokenId",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               },
//               {
//                   "name": "quantity",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               },
//               {
//                   "name": "data",
//                   "internalType": "bytes",
//                   "type": "bytes"
//               }
//           ],
//           "name": "adminMint",
//           "outputs": []
//       },
//       {
//           "stateMutability": "view",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "lastTokenId",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               }
//           ],
//           "name": "assumeLastTokenIdMatches",
//           "outputs": []
//       },
//       {
//           "stateMutability": "view",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "account",
//                   "internalType": "address",
//                   "type": "address"
//               },
//               {
//                   "name": "id",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               }
//           ],
//           "name": "balanceOf",
//           "outputs": [
//               {
//                   "name": "",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               }
//           ]
//       },
//       {
//           "stateMutability": "view",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "accounts",
//                   "internalType": "address[]",
//                   "type": "address[]"
//               },
//               {
//                   "name": "ids",
//                   "internalType": "uint256[]",
//                   "type": "uint256[]"
//               }
//           ],
//           "name": "balanceOfBatch",
//           "outputs": [
//               {
//                   "name": "batchBalances",
//                   "internalType": "uint256[]",
//                   "type": "uint256[]"
//               }
//           ]
//       },
//       {
//           "stateMutability": "nonpayable",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "from",
//                   "internalType": "address",
//                   "type": "address"
//               },
//               {
//                   "name": "tokenIds",
//                   "internalType": "uint256[]",
//                   "type": "uint256[]"
//               },
//               {
//                   "name": "amounts",
//                   "internalType": "uint256[]",
//                   "type": "uint256[]"
//               }
//           ],
//           "name": "burnBatch",
//           "outputs": []
//       },
//       {
//           "stateMutability": "nonpayable",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "tokenId",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               },
//               {
//                   "name": "data",
//                   "internalType": "bytes",
//                   "type": "bytes"
//               }
//           ],
//           "name": "callRenderer",
//           "outputs": []
//       },
//       {
//           "stateMutability": "nonpayable",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "tokenId",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               },
//               {
//                   "name": "salesConfig",
//                   "internalType": "contract IMinter1155",
//                   "type": "address"
//               },
//               {
//                   "name": "data",
//                   "internalType": "bytes",
//                   "type": "bytes"
//               }
//           ],
//           "name": "callSale",
//           "outputs": []
//       },
//       {
//           "stateMutability": "pure",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "mintPrice",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               },
//               {
//                   "name": "quantity",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               }
//           ],
//           "name": "computeTotalReward",
//           "outputs": [
//               {
//                   "name": "",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               }
//           ]
//       },
//       {
//           "stateMutability": "view",
//           "type": "function",
//           "inputs": [],
//           "name": "config",
//           "outputs": [
//               {
//                   "name": "owner",
//                   "internalType": "address",
//                   "type": "address"
//               },
//               {
//                   "name": "__gap1",
//                   "internalType": "uint96",
//                   "type": "uint96"
//               },
//               {
//                   "name": "fundsRecipient",
//                   "internalType": "address payable",
//                   "type": "address"
//               },
//               {
//                   "name": "__gap2",
//                   "internalType": "uint96",
//                   "type": "uint96"
//               },
//               {
//                   "name": "transferHook",
//                   "internalType": "contract ITransferHookReceiver",
//                   "type": "address"
//               },
//               {
//                   "name": "__gap3",
//                   "internalType": "uint96",
//                   "type": "uint96"
//               }
//           ]
//       },
//       {
//           "stateMutability": "view",
//           "type": "function",
//           "inputs": [],
//           "name": "contractURI",
//           "outputs": [
//               {
//                   "name": "",
//                   "internalType": "string",
//                   "type": "string"
//               }
//           ]
//       },
//       {
//           "stateMutability": "pure",
//           "type": "function",
//           "inputs": [],
//           "name": "contractVersion",
//           "outputs": [
//               {
//                   "name": "",
//                   "internalType": "string",
//                   "type": "string"
//               }
//           ]
//       },
//       {
//           "stateMutability": "view",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               }
//           ],
//           "name": "createReferrals",
//           "outputs": [
//               {
//                   "name": "",
//                   "internalType": "address",
//                   "type": "address"
//               }
//           ]
//       },
//       {
//           "stateMutability": "view",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               }
//           ],
//           "name": "customRenderers",
//           "outputs": [
//               {
//                   "name": "",
//                   "internalType": "contract IRenderer1155",
//                   "type": "address"
//               }
//           ]
//       },
//       {
//           "stateMutability": "nonpayable",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "premintConfig",
//                   "internalType": "bytes",
//                   "type": "bytes"
//               },
//               {
//                   "name": "premintVersion",
//                   "internalType": "bytes32",
//                   "type": "bytes32"
//               },
//               {
//                   "name": "signature",
//                   "internalType": "bytes",
//                   "type": "bytes"
//               },
//               {
//                   "name": "firstMinter",
//                   "internalType": "address",
//                   "type": "address"
//               },
//               {
//                   "name": "premintSignerContract",
//                   "internalType": "address",
//                   "type": "address"
//               }
//           ],
//           "name": "delegateSetupNewToken",
//           "outputs": [
//               {
//                   "name": "newTokenId",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               }
//           ]
//       },
//       {
//           "stateMutability": "view",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "",
//                   "internalType": "uint32",
//                   "type": "uint32"
//               }
//           ],
//           "name": "delegatedTokenId",
//           "outputs": [
//               {
//                   "name": "",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               }
//           ]
//       },
//       {
//           "stateMutability": "view",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               }
//           ],
//           "name": "firstMinters",
//           "outputs": [
//               {
//                   "name": "",
//                   "internalType": "address",
//                   "type": "address"
//               }
//           ]
//       },
//       {
//           "stateMutability": "view",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "tokenId",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               }
//           ],
//           "name": "getCreatorRewardRecipient",
//           "outputs": [
//               {
//                   "name": "",
//                   "internalType": "address",
//                   "type": "address"
//               }
//           ]
//       },
//       {
//           "stateMutability": "view",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "tokenId",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               }
//           ],
//           "name": "getCustomRenderer",
//           "outputs": [
//               {
//                   "name": "customRenderer",
//                   "internalType": "contract IRenderer1155",
//                   "type": "address"
//               }
//           ]
//       },
//       {
//           "stateMutability": "view",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "tokenId",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               }
//           ],
//           "name": "getRoyalties",
//           "outputs": [
//               {
//                   "name": "",
//                   "internalType": "struct ICreatorRoyaltiesControl.RoyaltyConfiguration",
//                   "type": "tuple",
//                   "components": [
//                       {
//                           "name": "royaltyMintSchedule",
//                           "internalType": "uint32",
//                           "type": "uint32"
//                       },
//                       {
//                           "name": "royaltyBPS",
//                           "internalType": "uint32",
//                           "type": "uint32"
//                       },
//                       {
//                           "name": "royaltyRecipient",
//                           "internalType": "address",
//                           "type": "address"
//                       }
//                   ]
//               }
//           ]
//       },
//       {
//           "stateMutability": "view",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "tokenId",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               }
//           ],
//           "name": "getTokenInfo",
//           "outputs": [
//               {
//                   "name": "",
//                   "internalType": "struct IZoraCreator1155TypesV1.TokenData",
//                   "type": "tuple",
//                   "components": [
//                       {
//                           "name": "uri",
//                           "internalType": "string",
//                           "type": "string"
//                       },
//                       {
//                           "name": "maxSupply",
//                           "internalType": "uint256",
//                           "type": "uint256"
//                       },
//                       {
//                           "name": "totalMinted",
//                           "internalType": "uint256",
//                           "type": "uint256"
//                       }
//                   ]
//               }
//           ]
//       },
//       {
//           "stateMutability": "view",
//           "type": "function",
//           "inputs": [],
//           "name": "implementation",
//           "outputs": [
//               {
//                   "name": "",
//                   "internalType": "address",
//                   "type": "address"
//               }
//           ]
//       },
//       {
//           "stateMutability": "nonpayable",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "contractName",
//                   "internalType": "string",
//                   "type": "string"
//               },
//               {
//                   "name": "newContractURI",
//                   "internalType": "string",
//                   "type": "string"
//               },
//               {
//                   "name": "defaultRoyaltyConfiguration",
//                   "internalType": "struct ICreatorRoyaltiesControl.RoyaltyConfiguration",
//                   "type": "tuple",
//                   "components": [
//                       {
//                           "name": "royaltyMintSchedule",
//                           "internalType": "uint32",
//                           "type": "uint32"
//                       },
//                       {
//                           "name": "royaltyBPS",
//                           "internalType": "uint32",
//                           "type": "uint32"
//                       },
//                       {
//                           "name": "royaltyRecipient",
//                           "internalType": "address",
//                           "type": "address"
//                       }
//                   ]
//               },
//               {
//                   "name": "defaultAdmin",
//                   "internalType": "address payable",
//                   "type": "address"
//               },
//               {
//                   "name": "setupActions",
//                   "internalType": "bytes[]",
//                   "type": "bytes[]"
//               }
//           ],
//           "name": "initialize",
//           "outputs": []
//       },
//       {
//           "stateMutability": "view",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "user",
//                   "internalType": "address",
//                   "type": "address"
//               },
//               {
//                   "name": "tokenId",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               },
//               {
//                   "name": "role",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               }
//           ],
//           "name": "isAdminOrRole",
//           "outputs": [
//               {
//                   "name": "",
//                   "internalType": "bool",
//                   "type": "bool"
//               }
//           ]
//       },
//       {
//           "stateMutability": "view",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "account",
//                   "internalType": "address",
//                   "type": "address"
//               },
//               {
//                   "name": "operator",
//                   "internalType": "address",
//                   "type": "address"
//               }
//           ],
//           "name": "isApprovedForAll",
//           "outputs": [
//               {
//                   "name": "",
//                   "internalType": "bool",
//                   "type": "bool"
//               }
//           ]
//       },
//       {
//           "stateMutability": "view",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               }
//           ],
//           "name": "metadataRendererContract",
//           "outputs": [
//               {
//                   "name": "",
//                   "internalType": "address",
//                   "type": "address"
//               }
//           ]
//       },
//       {
//           "stateMutability": "payable",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "minter",
//                   "internalType": "contract IMinter1155",
//                   "type": "address"
//               },
//               {
//                   "name": "tokenId",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               },
//               {
//                   "name": "quantity",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               },
//               {
//                   "name": "rewardsRecipients",
//                   "internalType": "address[]",
//                   "type": "address[]"
//               },
//               {
//                   "name": "minterArguments",
//                   "internalType": "bytes",
//                   "type": "bytes"
//               }
//           ],
//           "name": "mint",
//           "outputs": []
//       },
//       {
//           "stateMutability": "view",
//           "type": "function",
//           "inputs": [],
//           "name": "mintFee",
//           "outputs": [
//               {
//                   "name": "",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               }
//           ]
//       },
//       {
//           "stateMutability": "payable",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "mintTokenIds",
//                   "internalType": "uint256[]",
//                   "type": "uint256[]"
//               },
//               {
//                   "name": "quantities",
//                   "internalType": "uint256[]",
//                   "type": "uint256[]"
//               },
//               {
//                   "name": "minter",
//                   "internalType": "contract IMinter1155",
//                   "type": "address"
//               },
//               {
//                   "name": "tokenId",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               },
//               {
//                   "name": "rewardsRecipients",
//                   "internalType": "address[]",
//                   "type": "address[]"
//               },
//               {
//                   "name": "minterArguments",
//                   "internalType": "bytes",
//                   "type": "bytes"
//               }
//           ],
//           "name": "mintWithMints",
//           "outputs": [
//               {
//                   "name": "quantityMinted",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               }
//           ]
//       },
//       {
//           "stateMutability": "payable",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "minter",
//                   "internalType": "contract IMinter1155",
//                   "type": "address"
//               },
//               {
//                   "name": "tokenId",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               },
//               {
//                   "name": "quantity",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               },
//               {
//                   "name": "minterArguments",
//                   "internalType": "bytes",
//                   "type": "bytes"
//               },
//               {
//                   "name": "mintReferral",
//                   "internalType": "address",
//                   "type": "address"
//               }
//           ],
//           "name": "mintWithRewards",
//           "outputs": []
//       },
//       {
//           "stateMutability": "nonpayable",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "data",
//                   "internalType": "bytes[]",
//                   "type": "bytes[]"
//               }
//           ],
//           "name": "multicall",
//           "outputs": [
//               {
//                   "name": "results",
//                   "internalType": "bytes[]",
//                   "type": "bytes[]"
//               }
//           ]
//       },
//       {
//           "stateMutability": "view",
//           "type": "function",
//           "inputs": [],
//           "name": "name",
//           "outputs": [
//               {
//                   "name": "",
//                   "internalType": "string",
//                   "type": "string"
//               }
//           ]
//       },
//       {
//           "stateMutability": "view",
//           "type": "function",
//           "inputs": [],
//           "name": "nextTokenId",
//           "outputs": [
//               {
//                   "name": "",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               }
//           ]
//       },
//       {
//           "stateMutability": "view",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "",
//                   "internalType": "address",
//                   "type": "address"
//               },
//               {
//                   "name": "",
//                   "internalType": "address",
//                   "type": "address"
//               },
//               {
//                   "name": "",
//                   "internalType": "uint256[]",
//                   "type": "uint256[]"
//               },
//               {
//                   "name": "",
//                   "internalType": "uint256[]",
//                   "type": "uint256[]"
//               },
//               {
//                   "name": "",
//                   "internalType": "bytes",
//                   "type": "bytes"
//               }
//           ],
//           "name": "onERC1155BatchReceived",
//           "outputs": [
//               {
//                   "name": "",
//                   "internalType": "bytes4",
//                   "type": "bytes4"
//               }
//           ]
//       },
//       {
//           "stateMutability": "view",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "",
//                   "internalType": "address",
//                   "type": "address"
//               },
//               {
//                   "name": "",
//                   "internalType": "address",
//                   "type": "address"
//               },
//               {
//                   "name": "",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               },
//               {
//                   "name": "",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               },
//               {
//                   "name": "",
//                   "internalType": "bytes",
//                   "type": "bytes"
//               }
//           ],
//           "name": "onERC1155Received",
//           "outputs": [
//               {
//                   "name": "",
//                   "internalType": "bytes4",
//                   "type": "bytes4"
//               }
//           ]
//       },
//       {
//           "stateMutability": "view",
//           "type": "function",
//           "inputs": [],
//           "name": "owner",
//           "outputs": [
//               {
//                   "name": "",
//                   "internalType": "address",
//                   "type": "address"
//               }
//           ]
//       },
//       {
//           "stateMutability": "view",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               },
//               {
//                   "name": "",
//                   "internalType": "address",
//                   "type": "address"
//               }
//           ],
//           "name": "permissions",
//           "outputs": [
//               {
//                   "name": "",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               }
//           ]
//       },
//       {
//           "stateMutability": "view",
//           "type": "function",
//           "inputs": [],
//           "name": "proxiableUUID",
//           "outputs": [
//               {
//                   "name": "",
//                   "internalType": "bytes32",
//                   "type": "bytes32"
//               }
//           ]
//       },
//       {
//           "stateMutability": "nonpayable",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "tokenId",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               },
//               {
//                   "name": "user",
//                   "internalType": "address",
//                   "type": "address"
//               },
//               {
//                   "name": "permissionBits",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               }
//           ],
//           "name": "removePermission",
//           "outputs": []
//       },
//       {
//           "stateMutability": "view",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               }
//           ],
//           "name": "royalties",
//           "outputs": [
//               {
//                   "name": "royaltyMintSchedule",
//                   "internalType": "uint32",
//                   "type": "uint32"
//               },
//               {
//                   "name": "royaltyBPS",
//                   "internalType": "uint32",
//                   "type": "uint32"
//               },
//               {
//                   "name": "royaltyRecipient",
//                   "internalType": "address",
//                   "type": "address"
//               }
//           ]
//       },
//       {
//           "stateMutability": "view",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "tokenId",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               },
//               {
//                   "name": "salePrice",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               }
//           ],
//           "name": "royaltyInfo",
//           "outputs": [
//               {
//                   "name": "receiver",
//                   "internalType": "address",
//                   "type": "address"
//               },
//               {
//                   "name": "royaltyAmount",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               }
//           ]
//       },
//       {
//           "stateMutability": "nonpayable",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "from",
//                   "internalType": "address",
//                   "type": "address"
//               },
//               {
//                   "name": "to",
//                   "internalType": "address",
//                   "type": "address"
//               },
//               {
//                   "name": "ids",
//                   "internalType": "uint256[]",
//                   "type": "uint256[]"
//               },
//               {
//                   "name": "amounts",
//                   "internalType": "uint256[]",
//                   "type": "uint256[]"
//               },
//               {
//                   "name": "data",
//                   "internalType": "bytes",
//                   "type": "bytes"
//               }
//           ],
//           "name": "safeBatchTransferFrom",
//           "outputs": []
//       },
//       {
//           "stateMutability": "nonpayable",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "from",
//                   "internalType": "address",
//                   "type": "address"
//               },
//               {
//                   "name": "to",
//                   "internalType": "address",
//                   "type": "address"
//               },
//               {
//                   "name": "id",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               },
//               {
//                   "name": "amount",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               },
//               {
//                   "name": "data",
//                   "internalType": "bytes",
//                   "type": "bytes"
//               }
//           ],
//           "name": "safeTransferFrom",
//           "outputs": []
//       },
//       {
//           "stateMutability": "nonpayable",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "operator",
//                   "internalType": "address",
//                   "type": "address"
//               },
//               {
//                   "name": "approved",
//                   "internalType": "bool",
//                   "type": "bool"
//               }
//           ],
//           "name": "setApprovalForAll",
//           "outputs": []
//       },
//       {
//           "stateMutability": "nonpayable",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "fundsRecipient",
//                   "internalType": "address payable",
//                   "type": "address"
//               }
//           ],
//           "name": "setFundsRecipient",
//           "outputs": []
//       },
//       {
//           "stateMutability": "nonpayable",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "newOwner",
//                   "internalType": "address",
//                   "type": "address"
//               }
//           ],
//           "name": "setOwner",
//           "outputs": []
//       },
//       {
//           "stateMutability": "nonpayable",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "tokenId",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               },
//               {
//                   "name": "renderer",
//                   "internalType": "contract IRenderer1155",
//                   "type": "address"
//               }
//           ],
//           "name": "setTokenMetadataRenderer",
//           "outputs": []
//       },
//       {
//           "stateMutability": "nonpayable",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "transferHook",
//                   "internalType": "contract ITransferHookReceiver",
//                   "type": "address"
//               }
//           ],
//           "name": "setTransferHook",
//           "outputs": []
//       },
//       {
//           "stateMutability": "nonpayable",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "newURI",
//                   "internalType": "string",
//                   "type": "string"
//               },
//               {
//                   "name": "maxSupply",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               }
//           ],
//           "name": "setupNewToken",
//           "outputs": [
//               {
//                   "name": "",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               }
//           ]
//       },
//       {
//           "stateMutability": "nonpayable",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "newURI",
//                   "internalType": "string",
//                   "type": "string"
//               },
//               {
//                   "name": "maxSupply",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               },
//               {
//                   "name": "createReferral",
//                   "internalType": "address",
//                   "type": "address"
//               }
//           ],
//           "name": "setupNewTokenWithCreateReferral",
//           "outputs": [
//               {
//                   "name": "",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               }
//           ]
//       },
//       {
//           "stateMutability": "pure",
//           "type": "function",
//           "inputs": [],
//           "name": "supportedPremintSignatureVersions",
//           "outputs": [
//               {
//                   "name": "",
//                   "internalType": "string[]",
//                   "type": "string[]"
//               }
//           ]
//       },
//       {
//           "stateMutability": "view",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "interfaceId",
//                   "internalType": "bytes4",
//                   "type": "bytes4"
//               }
//           ],
//           "name": "supportsInterface",
//           "outputs": [
//               {
//                   "name": "",
//                   "internalType": "bool",
//                   "type": "bool"
//               }
//           ]
//       },
//       {
//           "stateMutability": "pure",
//           "type": "function",
//           "inputs": [],
//           "name": "symbol",
//           "outputs": [
//               {
//                   "name": "",
//                   "internalType": "string",
//                   "type": "string"
//               }
//           ]
//       },
//       {
//           "stateMutability": "nonpayable",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "_newURI",
//                   "internalType": "string",
//                   "type": "string"
//               },
//               {
//                   "name": "_newName",
//                   "internalType": "string",
//                   "type": "string"
//               }
//           ],
//           "name": "updateContractMetadata",
//           "outputs": []
//       },
//       {
//           "stateMutability": "nonpayable",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "tokenId",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               },
//               {
//                   "name": "recipient",
//                   "internalType": "address",
//                   "type": "address"
//               }
//           ],
//           "name": "updateCreateReferral",
//           "outputs": []
//       },
//       {
//           "stateMutability": "nonpayable",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "tokenId",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               },
//               {
//                   "name": "newConfiguration",
//                   "internalType": "struct ICreatorRoyaltiesControl.RoyaltyConfiguration",
//                   "type": "tuple",
//                   "components": [
//                       {
//                           "name": "royaltyMintSchedule",
//                           "internalType": "uint32",
//                           "type": "uint32"
//                       },
//                       {
//                           "name": "royaltyBPS",
//                           "internalType": "uint32",
//                           "type": "uint32"
//                       },
//                       {
//                           "name": "royaltyRecipient",
//                           "internalType": "address",
//                           "type": "address"
//                       }
//                   ]
//               }
//           ],
//           "name": "updateRoyaltiesForToken",
//           "outputs": []
//       },
//       {
//           "stateMutability": "nonpayable",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "tokenId",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               },
//               {
//                   "name": "_newURI",
//                   "internalType": "string",
//                   "type": "string"
//               }
//           ],
//           "name": "updateTokenURI",
//           "outputs": []
//       },
//       {
//           "stateMutability": "nonpayable",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "newImplementation",
//                   "internalType": "address",
//                   "type": "address"
//               }
//           ],
//           "name": "upgradeTo",
//           "outputs": []
//       },
//       {
//           "stateMutability": "payable",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "newImplementation",
//                   "internalType": "address",
//                   "type": "address"
//               },
//               {
//                   "name": "data",
//                   "internalType": "bytes",
//                   "type": "bytes"
//               }
//           ],
//           "name": "upgradeToAndCall",
//           "outputs": []
//       },
//       {
//           "stateMutability": "view",
//           "type": "function",
//           "inputs": [
//               {
//                   "name": "tokenId",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               }
//           ],
//           "name": "uri",
//           "outputs": [
//               {
//                   "name": "",
//                   "internalType": "string",
//                   "type": "string"
//               }
//           ]
//       },
//       {
//           "stateMutability": "nonpayable",
//           "type": "function",
//           "inputs": [],
//           "name": "withdraw",
//           "outputs": []
//       },
//       {
//           "type": "event",
//           "anonymous": false,
//           "inputs": [
//               {
//                   "name": "previousAdmin",
//                   "internalType": "address",
//                   "type": "address",
//                   "indexed": false
//               },
//               {
//                   "name": "newAdmin",
//                   "internalType": "address",
//                   "type": "address",
//                   "indexed": false
//               }
//           ],
//           "name": "AdminChanged"
//       },
//       {
//           "type": "event",
//           "anonymous": false,
//           "inputs": [
//               {
//                   "name": "account",
//                   "internalType": "address",
//                   "type": "address",
//                   "indexed": true
//               },
//               {
//                   "name": "operator",
//                   "internalType": "address",
//                   "type": "address",
//                   "indexed": true
//               },
//               {
//                   "name": "approved",
//                   "internalType": "bool",
//                   "type": "bool",
//                   "indexed": false
//               }
//           ],
//           "name": "ApprovalForAll"
//       },
//       {
//           "type": "event",
//           "anonymous": false,
//           "inputs": [
//               {
//                   "name": "beacon",
//                   "internalType": "address",
//                   "type": "address",
//                   "indexed": true
//               }
//           ],
//           "name": "BeaconUpgraded"
//       },
//       {
//           "type": "event",
//           "anonymous": false,
//           "inputs": [
//               {
//                   "name": "updater",
//                   "internalType": "address",
//                   "type": "address",
//                   "indexed": true
//               },
//               {
//                   "name": "updateType",
//                   "internalType": "enum IZoraCreator1155.ConfigUpdate",
//                   "type": "uint8",
//                   "indexed": true
//               },
//               {
//                   "name": "newConfig",
//                   "internalType": "struct IZoraCreator1155TypesV1.ContractConfig",
//                   "type": "tuple",
//                   "components": [
//                       {
//                           "name": "owner",
//                           "internalType": "address",
//                           "type": "address"
//                       },
//                       {
//                           "name": "__gap1",
//                           "internalType": "uint96",
//                           "type": "uint96"
//                       },
//                       {
//                           "name": "fundsRecipient",
//                           "internalType": "address payable",
//                           "type": "address"
//                       },
//                       {
//                           "name": "__gap2",
//                           "internalType": "uint96",
//                           "type": "uint96"
//                       },
//                       {
//                           "name": "transferHook",
//                           "internalType": "contract ITransferHookReceiver",
//                           "type": "address"
//                       },
//                       {
//                           "name": "__gap3",
//                           "internalType": "uint96",
//                           "type": "uint96"
//                       }
//                   ],
//                   "indexed": false
//               }
//           ],
//           "name": "ConfigUpdated"
//       },
//       {
//           "type": "event",
//           "anonymous": false,
//           "inputs": [
//               {
//                   "name": "updater",
//                   "internalType": "address",
//                   "type": "address",
//                   "indexed": true
//               },
//               {
//                   "name": "uri",
//                   "internalType": "string",
//                   "type": "string",
//                   "indexed": false
//               },
//               {
//                   "name": "name",
//                   "internalType": "string",
//                   "type": "string",
//                   "indexed": false
//               }
//           ],
//           "name": "ContractMetadataUpdated"
//       },
//       {
//           "type": "event",
//           "anonymous": false,
//           "inputs": [
//               {
//                   "name": "renderer",
//                   "internalType": "contract IRenderer1155",
//                   "type": "address",
//                   "indexed": false
//               }
//           ],
//           "name": "ContractRendererUpdated"
//       },
//       {
//           "type": "event",
//           "anonymous": false,
//           "inputs": [],
//           "name": "ContractURIUpdated"
//       },
//       {
//           "type": "event",
//           "anonymous": false,
//           "inputs": [
//               {
//                   "name": "structHash",
//                   "internalType": "bytes32",
//                   "type": "bytes32",
//                   "indexed": false
//               },
//               {
//                   "name": "domainName",
//                   "internalType": "string",
//                   "type": "string",
//                   "indexed": false
//               },
//               {
//                   "name": "version",
//                   "internalType": "string",
//                   "type": "string",
//                   "indexed": false
//               },
//               {
//                   "name": "creator",
//                   "internalType": "address",
//                   "type": "address",
//                   "indexed": false
//               },
//               {
//                   "name": "signature",
//                   "internalType": "bytes",
//                   "type": "bytes",
//                   "indexed": false
//               }
//           ],
//           "name": "CreatorAttribution"
//       },
//       {
//           "type": "event",
//           "anonymous": false,
//           "inputs": [
//               {
//                   "name": "version",
//                   "internalType": "uint8",
//                   "type": "uint8",
//                   "indexed": false
//               }
//           ],
//           "name": "Initialized"
//       },
//       {
//           "type": "event",
//           "anonymous": false,
//           "inputs": [
//               {
//                   "name": "lastOwner",
//                   "internalType": "address",
//                   "type": "address",
//                   "indexed": false
//               },
//               {
//                   "name": "newOwner",
//                   "internalType": "address",
//                   "type": "address",
//                   "indexed": false
//               }
//           ],
//           "name": "OwnershipTransferred"
//       },
//       {
//           "type": "event",
//           "anonymous": false,
//           "inputs": [
//               {
//                   "name": "sender",
//                   "internalType": "address",
//                   "type": "address",
//                   "indexed": true
//               },
//               {
//                   "name": "minter",
//                   "internalType": "address",
//                   "type": "address",
//                   "indexed": true
//               },
//               {
//                   "name": "tokenId",
//                   "internalType": "uint256",
//                   "type": "uint256",
//                   "indexed": true
//               },
//               {
//                   "name": "quantity",
//                   "internalType": "uint256",
//                   "type": "uint256",
//                   "indexed": false
//               },
//               {
//                   "name": "value",
//                   "internalType": "uint256",
//                   "type": "uint256",
//                   "indexed": false
//               }
//           ],
//           "name": "Purchased"
//       },
//       {
//           "type": "event",
//           "anonymous": false,
//           "inputs": [
//               {
//                   "name": "tokenId",
//                   "internalType": "uint256",
//                   "type": "uint256",
//                   "indexed": true
//               },
//               {
//                   "name": "renderer",
//                   "internalType": "address",
//                   "type": "address",
//                   "indexed": true
//               },
//               {
//                   "name": "user",
//                   "internalType": "address",
//                   "type": "address",
//                   "indexed": true
//               }
//           ],
//           "name": "RendererUpdated"
//       },
//       {
//           "type": "event",
//           "anonymous": false,
//           "inputs": [
//               {
//                   "name": "tokenId",
//                   "internalType": "uint256",
//                   "type": "uint256",
//                   "indexed": true
//               },
//               {
//                   "name": "sender",
//                   "internalType": "address",
//                   "type": "address",
//                   "indexed": true
//               },
//               {
//                   "name": "newURI",
//                   "internalType": "string",
//                   "type": "string",
//                   "indexed": false
//               },
//               {
//                   "name": "maxSupply",
//                   "internalType": "uint256",
//                   "type": "uint256",
//                   "indexed": false
//               }
//           ],
//           "name": "SetupNewToken"
//       },
//       {
//           "type": "event",
//           "anonymous": false,
//           "inputs": [
//               {
//                   "name": "operator",
//                   "internalType": "address",
//                   "type": "address",
//                   "indexed": true
//               },
//               {
//                   "name": "from",
//                   "internalType": "address",
//                   "type": "address",
//                   "indexed": true
//               },
//               {
//                   "name": "to",
//                   "internalType": "address",
//                   "type": "address",
//                   "indexed": true
//               },
//               {
//                   "name": "ids",
//                   "internalType": "uint256[]",
//                   "type": "uint256[]",
//                   "indexed": false
//               },
//               {
//                   "name": "values",
//                   "internalType": "uint256[]",
//                   "type": "uint256[]",
//                   "indexed": false
//               }
//           ],
//           "name": "TransferBatch"
//       },
//       {
//           "type": "event",
//           "anonymous": false,
//           "inputs": [
//               {
//                   "name": "operator",
//                   "internalType": "address",
//                   "type": "address",
//                   "indexed": true
//               },
//               {
//                   "name": "from",
//                   "internalType": "address",
//                   "type": "address",
//                   "indexed": true
//               },
//               {
//                   "name": "to",
//                   "internalType": "address",
//                   "type": "address",
//                   "indexed": true
//               },
//               {
//                   "name": "id",
//                   "internalType": "uint256",
//                   "type": "uint256",
//                   "indexed": false
//               },
//               {
//                   "name": "value",
//                   "internalType": "uint256",
//                   "type": "uint256",
//                   "indexed": false
//               }
//           ],
//           "name": "TransferSingle"
//       },
//       {
//           "type": "event",
//           "anonymous": false,
//           "inputs": [
//               {
//                   "name": "value",
//                   "internalType": "string",
//                   "type": "string",
//                   "indexed": false
//               },
//               {
//                   "name": "id",
//                   "internalType": "uint256",
//                   "type": "uint256",
//                   "indexed": true
//               }
//           ],
//           "name": "URI"
//       },
//       {
//           "type": "event",
//           "anonymous": false,
//           "inputs": [
//               {
//                   "name": "tokenId",
//                   "internalType": "uint256",
//                   "type": "uint256",
//                   "indexed": true
//               },
//               {
//                   "name": "user",
//                   "internalType": "address",
//                   "type": "address",
//                   "indexed": true
//               },
//               {
//                   "name": "permissions",
//                   "internalType": "uint256",
//                   "type": "uint256",
//                   "indexed": true
//               }
//           ],
//           "name": "UpdatedPermissions"
//       },
//       {
//           "type": "event",
//           "anonymous": false,
//           "inputs": [
//               {
//                   "name": "tokenId",
//                   "internalType": "uint256",
//                   "type": "uint256",
//                   "indexed": true
//               },
//               {
//                   "name": "user",
//                   "internalType": "address",
//                   "type": "address",
//                   "indexed": true
//               },
//               {
//                   "name": "configuration",
//                   "internalType": "struct ICreatorRoyaltiesControl.RoyaltyConfiguration",
//                   "type": "tuple",
//                   "components": [
//                       {
//                           "name": "royaltyMintSchedule",
//                           "internalType": "uint32",
//                           "type": "uint32"
//                       },
//                       {
//                           "name": "royaltyBPS",
//                           "internalType": "uint32",
//                           "type": "uint32"
//                       },
//                       {
//                           "name": "royaltyRecipient",
//                           "internalType": "address",
//                           "type": "address"
//                       }
//                   ],
//                   "indexed": false
//               }
//           ],
//           "name": "UpdatedRoyalties"
//       },
//       {
//           "type": "event",
//           "anonymous": false,
//           "inputs": [
//               {
//                   "name": "from",
//                   "internalType": "address",
//                   "type": "address",
//                   "indexed": true
//               },
//               {
//                   "name": "tokenId",
//                   "internalType": "uint256",
//                   "type": "uint256",
//                   "indexed": true
//               },
//               {
//                   "name": "tokenData",
//                   "internalType": "struct IZoraCreator1155TypesV1.TokenData",
//                   "type": "tuple",
//                   "components": [
//                       {
//                           "name": "uri",
//                           "internalType": "string",
//                           "type": "string"
//                       },
//                       {
//                           "name": "maxSupply",
//                           "internalType": "uint256",
//                           "type": "uint256"
//                       },
//                       {
//                           "name": "totalMinted",
//                           "internalType": "uint256",
//                           "type": "uint256"
//                       }
//                   ],
//                   "indexed": false
//               }
//           ],
//           "name": "UpdatedToken"
//       },
//       {
//           "type": "event",
//           "anonymous": false,
//           "inputs": [
//               {
//                   "name": "implementation",
//                   "internalType": "address",
//                   "type": "address",
//                   "indexed": true
//               }
//           ],
//           "name": "Upgraded"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "ADDRESS_DELEGATECALL_TO_NON_CONTRACT"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "ADDRESS_LOW_LEVEL_CALL_FAILED"
//       },
//       {
//           "type": "error",
//           "inputs": [
//               {
//                   "name": "operator",
//                   "internalType": "address",
//                   "type": "address"
//               },
//               {
//                   "name": "user",
//                   "internalType": "address",
//                   "type": "address"
//               }
//           ],
//           "name": "Burn_NotOwnerOrApproved"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "CREATOR_FUNDS_RECIPIENT_NOT_SET"
//       },
//       {
//           "type": "error",
//           "inputs": [
//               {
//                   "name": "reason",
//                   "internalType": "bytes",
//                   "type": "bytes"
//               }
//           ],
//           "name": "CallFailed"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "Call_TokenIdMismatch"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "CallerNotZoraCreator1155"
//       },
//       {
//           "type": "error",
//           "inputs": [
//               {
//                   "name": "tokenId",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               },
//               {
//                   "name": "quantity",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               },
//               {
//                   "name": "totalMinted",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               },
//               {
//                   "name": "maxSupply",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               }
//           ],
//           "name": "CannotMintMoreTokens"
//       },
//       {
//           "type": "error",
//           "inputs": [
//               {
//                   "name": "proposedAddress",
//                   "internalType": "address",
//                   "type": "address"
//               }
//           ],
//           "name": "Config_TransferHookNotSupported"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "ERC1155_ACCOUNTS_AND_IDS_LENGTH_MISMATCH"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "ERC1155_ADDRESS_ZERO_IS_NOT_A_VALID_OWNER"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "ERC1155_BURN_AMOUNT_EXCEEDS_BALANCE"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "ERC1155_BURN_FROM_ZERO_ADDRESS"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "ERC1155_CALLER_IS_NOT_TOKEN_OWNER_OR_APPROVED"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "ERC1155_ERC1155RECEIVER_REJECTED_TOKENS"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "ERC1155_IDS_AND_AMOUNTS_LENGTH_MISMATCH"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "ERC1155_INSUFFICIENT_BALANCE_FOR_TRANSFER"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "ERC1155_MINT_TO_ZERO_ADDRESS"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "ERC1155_MINT_TO_ZERO_ADDRESS"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "ERC1155_SETTING_APPROVAL_FOR_SELF"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "ERC1155_TRANSFER_TO_NON_ERC1155RECEIVER_IMPLEMENTER"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "ERC1155_TRANSFER_TO_ZERO_ADDRESS"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "ERC1967_NEW_IMPL_NOT_CONTRACT"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "ERC1967_NEW_IMPL_NOT_UUPS"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "ERC1967_UNSUPPORTED_PROXIABLEUUID"
//       },
//       {
//           "type": "error",
//           "inputs": [
//               {
//                   "name": "recipient",
//                   "internalType": "address",
//                   "type": "address"
//               },
//               {
//                   "name": "amount",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               }
//           ],
//           "name": "ETHWithdrawFailed"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "FUNCTION_MUST_BE_CALLED_THROUGH_ACTIVE_PROXY"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "FUNCTION_MUST_BE_CALLED_THROUGH_DELEGATECALL"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "FirstMinterAddressZero"
//       },
//       {
//           "type": "error",
//           "inputs": [
//               {
//                   "name": "amount",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               },
//               {
//                   "name": "contractValue",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               }
//           ],
//           "name": "FundsWithdrawInsolvent"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "INITIALIZABLE_CONTRACT_ALREADY_INITIALIZED"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "INITIALIZABLE_CONTRACT_IS_NOT_INITIALIZING"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "INVALID_ADDRESS_ZERO"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "INVALID_ETH_AMOUNT"
//       },
//       {
//           "type": "error",
//           "inputs": [
//               {
//                   "name": "mintTo",
//                   "internalType": "address",
//                   "type": "address"
//               },
//               {
//                   "name": "merkleProof",
//                   "internalType": "bytes32[]",
//                   "type": "bytes32[]"
//               },
//               {
//                   "name": "merkleRoot",
//                   "internalType": "bytes32",
//                   "type": "bytes32"
//               }
//           ],
//           "name": "InvalidMerkleProof"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "InvalidMintSchedule"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "InvalidMintSchedule"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "InvalidPremintVersion"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "InvalidSignature"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "InvalidSignatureVersion"
//       },
//       {
//           "type": "error",
//           "inputs": [
//               {
//                   "name": "magicValue",
//                   "internalType": "bytes4",
//                   "type": "bytes4"
//               }
//           ],
//           "name": "InvalidSigner"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "MintNotYetStarted"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "Mint_InsolventSaleTransfer"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "Mint_InvalidMintArrayLength"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "Mint_TokenIDMintNotAllowed"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "Mint_UnknownCommand"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "Mint_ValueTransferFail"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "MinterContractAlreadyExists"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "MinterContractDoesNotExist"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "NewOwnerNeedsToBeAdmin"
//       },
//       {
//           "type": "error",
//           "inputs": [
//               {
//                   "name": "tokenId",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               }
//           ],
//           "name": "NoRendererForToken"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "NonEthRedemption"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "ONLY_CREATE_REFERRAL"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "OnlyTransfersFromZoraMints"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "PremintDeleted"
//       },
//       {
//           "type": "error",
//           "inputs": [
//               {
//                   "name": "caller",
//                   "internalType": "address",
//                   "type": "address"
//               },
//               {
//                   "name": "recipient",
//                   "internalType": "address",
//                   "type": "address"
//               },
//               {
//                   "name": "amount",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               }
//           ],
//           "name": "ProtocolRewardsWithdrawFailed"
//       },
//       {
//           "type": "error",
//           "inputs": [
//               {
//                   "name": "renderer",
//                   "internalType": "address",
//                   "type": "address"
//               }
//           ],
//           "name": "RendererNotValid"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "Renderer_NotValidRendererContract"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "SaleEnded"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "SaleHasNotStarted"
//       },
//       {
//           "type": "error",
//           "inputs": [
//               {
//                   "name": "targetContract",
//                   "internalType": "address",
//                   "type": "address"
//               }
//           ],
//           "name": "Sale_CannotCallNonSalesContract"
//       },
//       {
//           "type": "error",
//           "inputs": [
//               {
//                   "name": "expected",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               },
//               {
//                   "name": "actual",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               }
//           ],
//           "name": "TokenIdMismatch"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "UUPS_UPGRADEABLE_MUST_NOT_BE_CALLED_THROUGH_DELEGATECALL"
//       },
//       {
//           "type": "error",
//           "inputs": [
//               {
//                   "name": "user",
//                   "internalType": "address",
//                   "type": "address"
//               },
//               {
//                   "name": "limit",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               },
//               {
//                   "name": "requestedAmount",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               }
//           ],
//           "name": "UserExceedsMintLimit"
//       },
//       {
//           "type": "error",
//           "inputs": [
//               {
//                   "name": "user",
//                   "internalType": "address",
//                   "type": "address"
//               },
//               {
//                   "name": "tokenId",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               },
//               {
//                   "name": "role",
//                   "internalType": "uint256",
//                   "type": "uint256"
//               }
//           ],
//           "name": "UserMissingRoleForToken"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "WrongValueSent"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "premintSignerContractFailedToRecoverSigner"
//       },
//       {
//           "type": "error",
//           "inputs": [],
//           "name": "premintSignerContractNotAContract"
//       }
//   ],
//   "functionName": "multicall",
//   "account": "0x5C6DC3b2a55be4b02e26b75848e27c19df4Af9fE",
//   "address": "0x8e038a4805d984162028f5978acd894fad310b56",
//   "args": [
//       [
//           "0xe72878b40000000000000000000000000000000000000000000000000000000000000022",
//           "0x674cbae60000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000ffffffffffffffff00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000037697066733a2f2f516d554667437a63364c4d4452504b6e614d694674637976595363773835464a7448574a4c3141757a4c467358392f30000000000000000000",
//           "0x8ec998a0000000000000000000000000000000000000000000000000000000000000002300000000000000000000000004e2516a2c207e84a1839755675dfd8ef6302f0a0000000000000000000000000000000000000000000000000000000000000004",
//           "0xd904b94a000000000000000000000000000000000000000000000000000000000000002300000000000000000000000004e2516a2c207e84a1839755675dfd8ef6302f0a000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000c434db7eee00000000000000000000000000000000000000000000000000000000000000230000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ffffffffffffffff000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000005c6dc3b2a55be4b02e26b75848e27c19df4af9fe00000000000000000000000000000000000000000000000000000000",
//           "0xafed7e9e0000000000000000000000000000000000000000000000000000000000000023000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003e80000000000000000000000005c6dc3b2a55be4b02e26b75848e27c19df4af9fe",
//           "0xc238d1ee0000000000000000000000005c6dc3b2a55be4b02e26b75848e27c19df4af9fe00000000000000000000000000000000000000000000000000000000000000230000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000000000"
//       ]
//   ]
// }
