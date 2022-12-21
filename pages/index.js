import Head from "next/head"
import Image from "next/image"
import styles from "../styles/Home.module.css"
import { useState, useEffect } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import networkMapping from "../constants/networkMapping.json"
import DexABI from "../constants/DexV1abi.json"
import YEAHABI from "../constants/YEAHabi.json"
import { Card, useNotification } from "web3uikit"
import UpdateListingModal from "../components/updateListingModal"

export default function Home() {
    const hideModal = () => setShowModal(false)
    const [showModal, setShowModal] = useState(false)
    const dispatch = useNotification()
    const { isWeb3Enabled, chainId, account } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "1337"

    const DexAddress = networkMapping[chainString]["MinimalViableDexV1"][0]
    const YeahTokenAddress = networkMapping[chainString]["YeahToken"][0]
    //useEffect
    async function updateUI() {
        //function calls to check balances, and so on
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])
    ///////////////////////////////////////////////////////////
    //web3 function calls
    //const { runContractFunction: getTokenURI } = useWeb3Contract({
    //abi: BasicNftABI,
    //contractAddress: nftAddress,
    //functionName: "tokenURI",
    //params: {
    //tokenId: tokenId,
    //},
    //})

    //const { runContractFunction: buyItem } = useWeb3Contract({
    //abi: NFTMarketABI,
    //contractAddress: marketplaceAddress,
    //functionName: "buyItem",
    //msgValue: price,
    //params: {
    //nftAddress: nftAddress,
    //tokenId: tokenId,
    //},
    //})
    /////////////////////////////////////////////////
    //Handle card clicks
    const handleCardClick = () => {
        console.log("handleCardClick")
        setShowModal(true)
    }

    return (
        <div className="container mx-auto">
            <h1 className="py-4 px-4 font-bold text-2xl">
                {chainString != 5 ? "Please connect to the Göerli testnet" : "Recently Listed NFTs"}
            </h1>
            <div className="space-x-6">
                {isWeb3Enabled ? (
                    chainString == 5 ? (
                        <div>
                            <UpdateListingModal
                                isVisible={showModal}
                                DexAddress={DexAddress}
                                YeahTokenAddress={YeahTokenAddress}
                                onClose={hideModal}
                            />
                            <Card
                                title="Approve Dex"
                                description="To add liquidity and to exchange tokens for eth the contract will need to have your approval to perform a transfer from your account to the contract itself."
                                onClick={handleCardClick}
                            >
                                <Image src="/dex-front/img/BUY.PNG" height="200" width="200" />
                            </Card>
                        </div>
                    ) : (
                        <div className="py-4 px-4 font-mono"> Thank you for your patience </div>
                    )
                ) : (
                    <div class="font-mono">
                        {" "}
                        Web3 currently not enabled, please connect your wallet
                    </div>
                )}
            </div>
        </div>
    )
}
