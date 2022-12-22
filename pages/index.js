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
import DexV1EthToToken from "../components/dexV1EthToToken"
import DexV1TokenToEth from "../components/dexV1TokenToEth"
import WETHabi from "../constants/WETHabi.json"
export default function Home() {
    const hideModal = () => setShowModal(false)
    const [showModal, setShowModal] = useState(false)
    const dispatch = useNotification()
    const { isWeb3Enabled, chainId, account } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "1337"

    const DexAddress = networkMapping[chainString]["MinimalViableDexV1"][0]
    const YeahTokenAddress = networkMapping[chainString]["YeahToken"][0]
    //stateVariables
    const [dexDisplayed, setDexDisplayed] = useState(0)
    const [showApprovedTokens, setShowApprovedTokens] = useState(false)
    const [approvedTokens, setApprovedTokens] = useState(0)
    const [tokenAmount, setTokenAmount] = useState(0)
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

    /////////////////////////////////////////////////
    //Handle card clicks
    const handleCardClick = () => {
        console.log("CardClick")
        approve({
            onError: (error) => {
                console.log(error)
            },
            onSuccess: (tx) => handleApproveSuccess(tx),
        })
    }
    const handleEthToTokenClick = () => {
        setDexDisplayed(1)
    }
    const handleTokenToEthClick = () => {
        setDexDisplayed(0)
    }
    ////handleSuccesses

    async function handleApproveSuccess(tx) {
        await tx.wait(1)
        dispatch({
            type: "success",
            message: "Tokens Approved",
            title: "Approve Transaction sent, wait for block to be mined",
            position: "topR",
        })
        if (dexDisplayed) {
            ethToToken({
                onError: (error) => {
                    console.log(error)
                },
                onSuccess: (tx) => handleExchangeSuccess(tx),
            })
        } else {
            tokenToEth({
                onError: (error) => {
                    console.log(error)
                },
                onSuccess: (tx) => handleExchangeSuccess(tx),
            })
        }
    }

    async function handleExchangeSuccess(tx) {
        dispatch({
            type: "success",
            message: "Token exchange transaction has been sent",
            title: "Transaction sent",
            position: "topR",
        })
    }
    //contract functions
    const { runContractFunction: allowance } = useWeb3Contract({
        abi: WBTCabi,
        contractAddress: YeahTokenAddress,
        functionName: "allowance",
        params: {
            _owner: account,
            _spender: DexAddress,
        },
    })
    const { runContractFunction: approve } = useWeb3Contract({
        abi: WETHabi,
        contractAddress: YeahTokenAddress,
        functionName: "approve",
        params: {
            guy: DexAddress,
            wad: ethers.utils.parseEther(tokenAmount.toString()),
        },
    })
    const { runContractFunction: ethToToken } = useWeb3Contract({
        abi: DexABI,
        contractAddress: DexAddress,
        functionName: "ethToToken",
        value: ethers.utils.parseEther(tokenAmount.toString()),
        params: {
            ethToToken: ethers.utils.parseEther(tokenAmount.toString()),
        },
    })
    const { runContractFunction: tokenToEth } = useWeb3Contract({
        abi: DexABI,
        contractAddress: DexAddress,
        functionName: "tokenToEth",
        params: {
            ethToToken: ethers.utils.parseEther(tokenAmount.toString()),
            tokens: ethers.utils.parseEther(tokenAmount.toString()),
        },
    })

    return (
        <div className="container mx-auto">
            <h1 className="py-4 px-4 font-bold text-2xl">
                {chainString != 5 ? "Please connect to the Göerli testnet" : ""}
            </h1>
            <div className="space-x-6 mx-6">
                {isWeb3Enabled ? (
                    chainString == 5 ? (
                        <div className="justify-center">
                            <div>
                                {dexDisplayed ? (
                                    <div>
                                        <ul class="flex">
                                            <li class="mr-3">
                                                <a
                                                    class="inline-block border border-blue-500 rounded py-1 px-3 bg-blue-500 text-white"
                                                    href="#"
                                                >
                                                    Eth to Tokens
                                                </a>
                                            </li>
                                            <li class="mr-3">
                                                <button
                                                    onClick={handleTokenToEthClick}
                                                    class="inline-block border border-white rounded hover:border-gray-200 text-blue-500 hover:bg-gray-200 py-1 px-3"
                                                    href="#"
                                                >
                                                    Tokens to Eth
                                                </button>
                                            </li>
                                        </ul>
                                        <DexV1EthToToken
                                            onClick={handleCardClick}
                                            setTokenAmount={setTokenAmount}
                                            tokenAmount={tokenAmount}
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <ul class="flex">
                                            <li class="mr-3">
                                                <button
                                                    onClick={handleEthToTokenClick}
                                                    class="inline-block border border-white rounded hover:border-gray-200 text-blue-500 hover:bg-gray-200 py-1 px-3"
                                                    href="#"
                                                >
                                                    Eth to Tokens
                                                </button>
                                            </li>
                                            <li class="mr-3">
                                                <a
                                                    class="inline-block border border-blue-500 rounded py-1 px-3 bg-blue-500 text-white"
                                                    href="#"
                                                >
                                                    Tokens to Eth
                                                </a>
                                            </li>
                                        </ul>
                                        <DexV1TokenToEth
                                            onClick={handleCardClick}
                                            setTokenAmount={setTokenAmount}
                                            tokenAmount={tokenAmount}
                                        />
                                    </div>
                                )}
                            </div>
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
