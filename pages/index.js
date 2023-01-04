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
import Reserves from "../components/reserves"

export default function Home() {
    const dispatch = useNotification()
    const { isWeb3Enabled, chainId, account } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "1337"

    const DexAddress = networkMapping[chainString]["DexV1"][0]
    const YeahTokenAddress = networkMapping[chainString]["YeahToken"][0]
    //stateVariables
    const [dexDisplayed, setDexDisplayed] = useState(0)
    const [tokenAmount, setTokenAmount] = useState("0.01")
    const [depositTokenAmount, setDepositTokenAmount] = useState(0)
    const [expectedTokenAmount, setExpectedTokenAmount] = useState(0)
    const [expectedEthAmount, setexpectedEthAmount] = useState(0)
    const [TokenReserves, setTokenReserves] = useState(0)
    const [EthReserves, setEthReserves] = useState(0)
    const [tokensApproved, setTokensApproved] = useState(0)
    const [tokensToApprove, setTokensToApprove] = useState(0)
    const [depositEthAmount, setDepositEthAmount] = useState(0)
    const [tokenAmountToApproveFinal, setTokenAmountToApproveFinal] = useState(0)
    //calculations
    async function ethToTokensBoughtCalculation() {
        let msgValue = ethers.utils.parseEther(tokenAmount)

        let tokenBalance = await getTokenReserves()
        let ethBalance = await getLiquidity()
        let initialEthReserves = ethBalance
        let input_with_fee = msgValue * 997
        let numerator = tokenBalance * input_with_fee
        let denominator = initialEthReserves * 1000 + input_with_fee
        let tokensBought = numerator / denominator

        console.log(ethers.utils.formatEther(tokensBought.toString()))
    }

    function updateDepositTokensCalculation() {
        if (depositEthAmount) {
            let tokenAmountToDeposit =
                (depositEthAmount * TokenReserves) / EthReserves + 1 / 1000000000000000000
            setTokensToApprove(tokenAmountToDeposit)
            setTokenAmountToApproveFinal(tokenAmountToDeposit - tokensApproved)
        } else {
            setTokensToApprove(0)
        }
    }

    //useEffect
    async function updateUI() {
        let allowanceUnformatted = await allowance()
        let allowanceFormatted = allowanceUnformatted / 1000000000000000000
        setTokensApproved(allowanceFormatted)
        let liquidity = await getLiquidity()
        console.log(liquidity)
        let liquidityFormatted = ethers.utils.formatEther(liquidity).toString()
        console.log(liquidityFormatted)
        setEthReserves(liquidityFormatted)
        let tokenReserves = await getTokenReserves()
        let tokenReservesFormatted = ethers.utils.formatEther(tokenReserves)
        setTokenReserves(tokenReservesFormatted)
    }
    //Function called onChange when introducing correct input
    async function updateExpecteds() {
        if (dexDisplayed) {
            ethToTokensBought()

            let tokensExpected = await ethToTokenView()
            let tokensExpectedFormatted = ethers.utils.formatEther(tokensExpected)
            setExpectedTokenAmount(tokensExpectedFormatted)
        } else {
            let ethExpected = await tokenToEthView()
            let ethExpectedFormatted = ethExpected / 1000000000000000000
            console.log(`eth exp ${ethExpectedFormatted}`)
            setexpectedEthAmount(ethExpectedFormatted)
        }
    }

    useEffect(() => {
        if (/^\d+\.*(\d+)*$/.test(depositTokenAmount)) {
            updateDepositTokensCalculation()
        } else {
            console.log("incorrect input")
        }
        if (/^\d+\.*(\d+)*$/.test(tokenAmount)) {
            updateExpecteds()
        } else {
            console.log("nope")
        }
    }, [tokenAmount, isWeb3Enabled, depositEthAmount])

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])
    ///////////////////////////////////////////////////////////

    /////////////////////////////////////////////////
    //Handle card clicks
    const handleCardClick = () => {
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
    const handleDepositClick = () => {
        console.log("depositclick")
    }
    async function approveDepositClick() {
        await approveDeposit({
            onError: (error) => console.log(error),
            onSuccess: handleBuyItemSuccess,
        })
    }
    const handleBuyItemSuccess = () => {
        dispatch({
            type: "success",
            message: "Tokens Approved - please refresh page",
            title: "Tokens Approved",
            position: "topR",
        })
    }
    const handleApproveClick = () => {
        approveDepositClick()
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
    const { runContractFunction: approveDeposit } = useWeb3Contract({
        abi: WETHabi,
        contractAddress: YeahTokenAddress,
        functionName: "approve",
        params: {
            guy: DexAddress,
            wad: ethers.utils.parseEther(tokenAmountToApproveFinal.toString()),
        },
    })
    const { runContractFunction: approveExchange } = useWeb3Contract({
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
    const { runContractFunction: tokenToEthView } = useWeb3Contract({
        abi: DexABI,
        contractAddress: DexAddress,
        functionName: "tokenToEthView",
        params: {
            tokens: ethers.utils.parseEther(tokenAmount.toString()),
        },
    })
    const { runContractFunction: ethToTokenView } = useWeb3Contract({
        abi: DexABI,
        contractAddress: DexAddress,
        functionName: "ethToTokenView",

        params: {
            msgValue: ethers.utils.parseEther(tokenAmount).toString(),
        },
    })
    const { runContractFunction: getLiquidity } = useWeb3Contract({
        abi: DexABI,
        contractAddress: DexAddress,
        functionName: "getLiquidity",

        params: {},
    })
    const { runContractFunction: getTokenReserves } = useWeb3Contract({
        abi: DexABI,
        contractAddress: DexAddress,
        functionName: "getTokenReserves",

        params: {},
    })
    return (
        <div className="container mx-auto">
            <h1 className="py-4 px-4 font-bold text-2xl">
                {chainString != 5 ? "Please connect to the Göerli testnet" : ""}
            </h1>
            <div className="space-x-6 mx-6">
                <Reserves
                    tokenReserves={TokenReserves}
                    ethReserves={EthReserves}
                    tokensApproved={tokensApproved}
                    setDepositTokenAmount={setDepositTokenAmount}
                    depositTokenAmount={depositTokenAmount}
                    onDepositClick={handleDepositClick}
                    onApproveClick={handleApproveClick}
                    setDepositEthAmount={setDepositEthAmount}
                    depositEthAmount={depositEthAmount}
                    tokensToApprove={tokensToApprove}
                />
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
