import { useEffect, useState } from "react";
import { Button, Col, Spinner, Card, Row } from "react-bootstrap";
import styles from "./NFTAdmin.module.scss";
import { useWeb3React } from "@web3-react/core";
import contractABI from "../../WalletHelpers/contractAbi.json";
import { useMoralisWeb3Api } from "react-moralis";

const NFTAdmin = () => {
  const Web3Api = useMoralisWeb3Api();
  const { account, library } = useWeb3React();
  const [hash, setHash] = useState<string>("");
  const [transactionReceipt, setTransactionReceipt] = useState<any>(null);
  const [userNFTs, setUserNFTs] = useState<any[] | undefined>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const transactionLink = `https://etherscan.io/tx/${hash}`;
  const contractAddress = "0x787Fc8eAd1968550D72037a995D9492E55fd3764";
  const openSeaLink = `https://testnets.opensea.io/assets/${contractAddress}/`;
  const contract = new library.eth.Contract(
    contractABI as any,
    contractAddress
  );

  useEffect(() => {
    (async () => {
      if (!!account && !!library) {
        const getUserNFTs = await Web3Api.account.getNFTsForContract({
          chain: "rinkeby",
          address: account,
          token_address: "0x787Fc8eAd1968550D72037a995D9492E55fd3764", //change for contract address
        });
        let userNFTData = [];

        if (getUserNFTs?.result) {
          for (let i = 0; i < getUserNFTs?.result.length; i++) {
            // const getImage = await getNFTMetadata(getUserNFTs?.result[i]?.token_uri);
            const isReveal = await getRevealStatus(
              getUserNFTs?.result[i]?.token_id
            );
            userNFTData.push({ ...getUserNFTs?.result[i], isReveal });
          }
        }
        /* userNFTData = [
          {
            token_address: "0x787fc8ead1968550d72037a995d9492e55fd3764",
            token_id: "15",
            block_number_minted: "10012212",
            owner_of: "0xd8350cf2c9224f2720b68585fea8cea2abb0dedc",
            block_number: "10012212",
            amount: "1",
            contract_type: "ERC1155",
            name: "TestTest",
            symbol: "TEST",
            token_uri: "https://another-nft.vercel.app/api/tokens/15",
            metadata: null,
            synced_at: "2022-01-18T11:15:38.110Z",
            is_valid: 0,
            syncing: 2,
            frozen: 0,
            isReveal: true,
          },
        ]; */
        setUserNFTs(userNFTData);
        /* console.log(userNFTData); */
      }
    })();
  }, [account, library]);

  const getRevealStatus = async (id: any) => {
    return await contract.methods.revealedNFT(id).call();
  };

  // const getNFTMetadata = async (token_uri: string | undefined): Promise<any> => {
  //     if (!token_uri) return '';

  //     try {
  //         const metadata = await fetch(token_uri, { mode: 'no-cors' });
  //         const json = await metadata.json();
  //         return json.image;
  //     } catch {
  //         console.log('error geting metadata');
  //         return '';
  //     }
  // }

  const confirmationMessage = () => {
    return <p>this is the confirmation message</p>;
  };

  const NFTCards = () => {
    const userCards = userNFTs?.map((e: any) => {
      return (
        <>
          <Col
            key={e.token_id}
            md={3}
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "20px",
              marginRight: "20px",
              minWidth: "20%",
              height: "70vh",
            }}
          >
            {/* <img src={`https://gateway.pinata.cloud/${e.image.replace('://', '/')}`} alt='nft image' /> */}
            {/* <p>id: {e.token_id}</p> */}

            <Card className={styles.card}>
              <Card.Img className={styles.img} src="../mac_golden_ticket.gif" />
              <Card.Body className={styles.cardBody}>
                <Card.Text>Number: XXX</Card.Text>
                <Card.Text>
                  Status: {e.isReveal ? "REVEALED" : "not revealed"}
                </Card.Text>
                <Button
                  className={styles.button}
                  disabled={e.isReveal}
                  onClick={() => revealNFT(+e.token_id)}
                >
                  {e.isReveal ? "REVEALED" : "REVEAL NOW"}
                </Button>
                <Card.Text>
                  <img className={styles.emoji} src="/5.png" />
                </Card.Text>
                {/* {e.isReveal && (
                  <a href="">
                    <img className={styles.emojis} src="/5.png" />
                  </a>
                )} */}
              </Card.Body>
            </Card>
          </Col>
        </>
      );
    });

    return userCards;
  };

  const revealNFT = async (id: number): Promise<void> => {
    if (!!account && !!library) {
      setError("");
      setLoading(true);

      if (!(await contract.methods.canReveal().call())) {
        alert("Reveal option is not active");
        setLoading(false);
        return;
      }

      contract.methods
        .revealNFT(id)
        .send({ from: account })
        .on("transactionHash", function (hash: any) {
          setHash(hash);
        })
        .on("receipt", function (receipt: any) {
          setTransactionReceipt(receipt);
          setLoading(false);
        })
        .on("error", function (error: any, receipt: any) {
          setError(error.message);
          console.log("this is the error:", error.message);
          setLoading(false);
        });
    }
  };

  return (
    <>
      <Row>
        <div className={styles.private_sale_title}>
          In your wallet you have {userNFTs?.length} moody Ape
        </div>
      </Row>
      <Col className={styles.BOContainer}>
        {userNFTs && (
          <Row
            style={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {NFTCards()}
          </Row>
        )}
        <Col className="text-center">
          {hash && (
            <p>
              ✅ Check out your transaction on Etherscan{" "}
              <a href={transactionLink} target="_blank" rel="noreferrer">
                here
              </a>
            </p>
          )}

          {error && (
            <h3>
              😥 Something went wrong:
              <br />
              {error}
            </h3>
          )}

          {loading && (
            <h3>
              Waiting for transaction <Spinner animation="border" size="sm" />
            </h3>
          )}

          {transactionReceipt && confirmationMessage()}
        </Col>
      </Col>
    </>
  );
};

export default NFTAdmin;
