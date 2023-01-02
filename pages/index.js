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

    const DexAddress = networkMapping[chainString]["DexV1"][0]
    const YeahTokenAddress = networkMapping[chainString]["YeahToken"][0]
    //stateVariables
    const [dexDisplayed, setDexDisplayed] = useState(0)
    const [showApprovedTokens, setShowApprovedTokens] = useState(false)
    const [approvedTokens, setApprovedTokens] = useState(0)
    const [tokenAmount, setTokenAmount] = useState("0.0")
    const [expectedTokenAmount, setExpectedTokenAmount] = useState(0)
    const [expectedEthAmount, setexpectedEthAmount] = useState(0)
    const [validRequest, setValidRequest] = useState(false)
    console.log(`aloha ${/^\d+\.*(\d+)*$/.test(tokenAmount)}`)
    //validRequest checker
    async function requestChecker() {
        //return /^\d+$/.test(tokenAmount)
    }
    //useEffect
    async function updateUI() {
        setApprovedTokens(ethers.utils.formatEther(await allowance()))
        if (approvedTokens) {
            setShowApprovedTokens(true)
        }
    }
    async function updateExpecteds() {
        if (dexDisplayed) {
            setExpectedTokenAmount(ethers.utils.formatEther(await ethToTokenView()).toString())
        } else {
            setexpectedEthAmount(ethers.utils.formatEther(await tokenToEthView()).toString())
        }
    }

    useEffect(() => {
        if (parseFloat(tokenAmount) == NaN) {
            setValidRequest(false)
        } else {
            setValidRequest(true)
        }
        console.log(validRequest)
        if (validRequest) {
            if (isWeb3Enabled) {
                updateExpecteds()
            }
        }
    }, [tokenAmount])
    useEffect(() => {
        if (isWeb3Enabled) {
            if (validRequest) {
                // updateUI()
            }
        }
    }, [isWeb3Enabled])
    ///////////////////////////////////////////////////////////

    /////////////////////////////////////////////////
    //Handle card clicks
    const handleCardClick = () => {
        console.log("hello")
        if (tokenAmount > 0) {
            console.log("CardClick")
            approve({
                onError: (error) => {
                    console.log(error)
                },
                onSuccess: (tx) => handleApproveSuccess(tx),
            })
        }
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
            console.log("EthToTOken")
            ethToToken({
                onError: (error) => {
                    console.log(error)
                },
                onSuccess: (tx) => handleExchangeSuccess(tx),
            })
        } else {
            console.log("tokenToEth")
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
            wad: tokenAmount ? ethers.utils.parseEther(tokenAmount.toString()) : 1,
        },
    })
    const { runContractFunction: ethToToken } = useWeb3Contract({
        abi: DexABI,
        contractAddress: DexAddress,
        functionName: "ethToToken",
        value: tokenAmount == "" ? 1 : ethers.utils.parseEther(tokenAmount.toString()),
        params: {
            ethToToken: tokenAmount == "" ? 1 : ethers.utils.parseEther(tokenAmount.toString()),
        },
    })
    const { runContractFunction: tokenToEth } = useWeb3Contract({
        abi: DexABI,
        contractAddress: DexAddress,
        functionName: "tokenToEth",
        params: {
            ethToToken: tokenAmount == "" ? 1 : ethers.utils.parseEther(tokenAmount.toString()),
            tokens: tokenAmount == "" ? 1 : ethers.utils.parseEther(tokenAmount.toString()),
        },
    })
    const { runContractFunction: tokenToEthView } = useWeb3Contract({
        abi: DexABI,
        contractAddress: DexAddress,
        functionName: "tokenToEthView",
        params: {
            ethToToken: tokenAmount == "" ? 1 : ethers.utils.parseEther(tokenAmount.toString()),
            tokens: tokenAmount == "" ? 1 : ethers.utils.parseEther(tokenAmount.toString()),
        },
    })
    const { runContractFunction: ethToTokenView } = useWeb3Contract({
        abi: DexABI,
        contractAddress: DexAddress,
        functionName: "ethToTokenView",

        params: {
            msgValue: tokenAmount == "" ? 1 : ethers.utils.parseEther(tokenAmount.toString()),
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
                                            expectedTokens={expectedTokenAmount}
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
                                            expectedEth={expectedEthAmount}
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
