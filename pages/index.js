import Head from "next/head"
import Image from "next/image"
import checkImage from "../img/shield.png"
import thumbImage from "../img/thumb.png"
import styles from "../styles/Home.module.css"
import { useState, useEffect } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import networkMapping from "../constants/networkMapping.json"
import DexABI from "../constants/DexV1abi.json"
import YEAHABI from "../constants/YEAHabi.json"
import WBTCabi from "../constants/WBTC.json"
import { Card, useNotification } from "web3uikit"
import UpdateListingModal from "../components/updateListingModal"
import { ethers } from "ethers"

export default function Home() {
    const hideModal = () => setShowModal(false)
    const [showModal, setShowModal] = useState(false)
    const dispatch = useNotification()
    const { isWeb3Enabled, chainId, account } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "1337"

    const DexAddress = networkMapping[chainString]["MinimalViableDexV1"][0]
    const YeahTokenAddress = networkMapping[chainString]["YeahToken"][0]
    //stateVariables
    const [showApprovedTokens, setShowApprovedTokens] = useState(false)
    const [approvedTokens, setApprovedTokens] = useState(0)
    //useEffect
    async function updateUI() {
        setApprovedTokens(ethers.utils.formatEther(await allowance()))
        if (approvedTokens) {
            setShowApprovedTokens(true)
        }
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])
    ///////////////////////////////////////////////////////////

    const { runContractFunction: allowance } = useWeb3Contract({
        abi: WBTCabi,
        contractAddress: YeahTokenAddress,
        functionName: "allowance",
        params: {
            _owner: account,
            _spender: DexAddress,
        },
    })
    /////////////////////////////////////////////////
    //Handle card clicks
    const handleCardClick = () => {
        console.log("handleCardClick")
        setShowModal(true)
    }

    console.log(approvedTokens)
    return (
        <div className="container mx-auto">
            <h1 className="py-4 px-4 font-bold text-2xl">
                {chainString != 5 ? "Please connect to the Göerli testnet" : "Recently Listed NFTs"}
            </h1>
            <div className="space-x-6 mx-6">
                {isWeb3Enabled ? (
                    chainString == 5 ? (
                        <div className="justify-center">
                            <UpdateListingModal
                                isVisible={showModal}
                                DexAddress={DexAddress}
                                YeahTokenAddress={YeahTokenAddress}
                                onClose={hideModal}
                            />
                            {showApprovedTokens ? (
                                <Card
                                    className="al"
                                    title="Dex has been approved"
                                    description="To add liquidity and to exchange tokens for eth the contract will need to have your approval to perform a transfer from your account to the contract itself."
                                    onClick={handleCardClick}
                                >
                                    <Image src={thumbImage} height="100" width="100" />
                                    <div>{approvedTokens} </div>
                                    <div>YEAH tokens approved</div>
                                </Card>
                            ) : (
                                <Card
                                    className=""
                                    title="Approve Dex"
                                    description=""
                                    onClick={handleCardClick}
                                >
                                    <Image src={checkImage} height="100" width="100" />
                                </Card>
                            )}
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
            <TailwindCssButton />
        </div>
    )
}

function TailwindCssButton() {
    return (
        <button className="bg-blue-500 text-white font-medium px-4 py-2 rounded hover:bg-blue-600">
            test
        </button>
    )
}
