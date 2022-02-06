import type { NextApiRequest, NextApiResponse } from 'next';
import Web3 from 'web3';
import contractABI from '../../../WalletHelpers/contractAbi.json';
import NextCors from 'nextjs-cors';

const web3 = new Web3('https://mainnet.infura.io/v3/84842078b09946638c03157f83405213');
const Contract = new web3.eth.Contract(contractABI as any, '0xE534bD009274F9b891f80e3E42475f92e439f20c');

type Data = {
  resp: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  await NextCors(req, res, {
    methods: ['GET'],
    origin: '*',
    optionsSuccessStatus: 200,
  });

  const { query, method } = req;
  const { id } = query;

  const ipfsLink = 'https://gateway.pinata.cloud/ipfs/QmcTALMQRjw2KNXVtUdX5RGZhVVaDW8gh5qWjtqUtH2mj5/';
  const hiddenIpfsLink = 'https://gateway.pinata.cloud/ipfs/QmcTALMQRjw2KNXVtUdX5RGZhVVaDW8gh5qWjtqUtH2mj5/';

  if (method === 'GET') {
    const totalSupply = await Contract.methods.totalSupply().call();
    const lastId = totalSupply === 0 ? 0 : (totalSupply - 1);

    if (+id > lastId) {
      return res.status(404).send({ resp: "ERC1155Metadata: URI query for nonexistent token"})
    }

    // const getIpfsLink = async () => {
    //   if (!(await Contract.methods.revealedNFT(id).call())) {
    //     return hiddenIpfsLink;
    //   }
    //   return ipfsLink+id;
    // }

    try {
      // const response = await fetch(await getIpfsLink());
      // const json = await response.json();
      const json = JSON.parse('{"name":"Moody Ape X","description":"Made by Moody Ape Club project","image":"ipfs://QmauQp8oeKjYKL29wYMQANghLWjVejFzjxhWS6DwFmJ9go"}');

      return res.status(200).json(json);
    } catch (error) {
      console.log(error);
      return res.status(422).json({ resp: "Something went wrong" });
    }
  }

  return res.status(404).send({ resp: "Something went wrong"});
}