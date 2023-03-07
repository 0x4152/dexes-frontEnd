import Head from "next/head"
import Image from "next/image"
import checkImage from "../img/shield.png"
import thumbImage from "../img/thumb.png"
import styles from "../styles/Home.module.css"
import { useState, useEffect } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import networkMapping from "../constants/networkMapping.json"
import DexABI from "../constants/DexV1abi.json"
import DEXABI from "../constants/DEXabi.json"
import WBTCabi from "../constants/WBTC.json"
import LPTokenabi from "../constants/LPTokenabi.json"
import { Card, useNotification } from "web3uikit"
import { ethers } from "ethers"
import DexV1EthToToken from "../components/dexV1EthToToken"
import DexV1TokenToEth from "../components/dexV1TokenToEth"
import Graph from "../components/graph"
import WETHabi from "../constants/WETHabi.json"
import Reserves from "../components/reserves"
import Explanation from "../components/expl"
import { letterSpacing } from "@mui/system"

export default function Home() {
    const dispatch = useNotification()
    const { isWeb3Enabled, chainId, account } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "1337"

    const DexAddress = networkMapping[chainString]["DexV1"][0]
    const DEXTokenAddress = networkMapping[chainString]["DEXToken"][0]
    const LPTokenAddress = networkMapping[chainString]["LPToken"][0]
    //stateVariables
    const [dexDisplayed, setDexDisplayed] = useState(1)
    const [reservesDisplayed, setReservesDisplayed] = useState(1)
    const [tokenAmount, setTokenAmount] = useState(0)
    const [depositTokenAmount, setDepositTokenAmount] = useState(0)
    const [expectedTokenAmount, setExpectedTokenAmount] = useState(0)
    const [expectedEthAmount, setexpectedEthAmount] = useState(0)
    const [TokenReserves, setTokenReserves] = useState(0)
    const [LPTokens, setLPTokens] = useState(0)
    const [EthReserves, setEthReserves] = useState(0)
    const [tokensApproved, setTokensApproved] = useState(0)
    const [tokensToApprove, setTokensToApprove] = useState(0)
    const [tokensToApproveExchange, setTokensToApproveExchange] = useState(0)
    const [depositEthAmount, setDepositEthAmount] = useState(0)
    const [tokenAmountToApproveFinal, setTokenAmountToApproveFinal] = useState(0)
    const [withdrawAmount, setWithdrawAmount] = useState(0)
    const [showExp, setShowExp] = useState(0)
    //calculations
    async function ethToTokensBoughtCalculation() {
        let msgValue = ethers.utils.parseEther(tokenAmount.toString())

        let tokenBalance = await getTokenReserves()
        let ethBalance = await getLiquidity()
        let initialEthReserves = ethBalance
        let input_with_fee = msgValue * 997
        let numerator = tokenBalance * input_with_fee
        let denominator = initialEthReserves * 1000 + input_with_fee
        let tokensBought = numerator / denominator
    }
    //Function that updates the amount of tokens that need to be approved to deposit "depositEthAmount" (the input in the deposit liquidity), to
    //To take exactly that amount of tokens upon depositing.
    function updateDepositTokensCalculation() {
        if (depositEthAmount > 0) {
            let tokenAmountToDeposit =
                (depositEthAmount * TokenReserves) / EthReserves + 1 / 1000000000000000000
            setTokensToApprove(tokenAmountToDeposit)
            setTokenAmountToApproveFinal(tokenAmountToDeposit + 0.0000000002)
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
        let liquidityFormatted = liquidity ? ethers.utils.formatEther(liquidity.toString()) : 0
        setEthReserves(liquidityFormatted)
        let tokenReserves = await getTokenReserves()
        let tokenReservesFormatted = tokenReserves
            ? ethers.utils.formatEther(tokenReserves.toString())
            : 0
        setTokenReserves(tokenReservesFormatted)
    }
    //Function called onChange when introducing correct input
    async function updateExpecteds() {
        let LPTokens = await balanceOf()
        let LPTokensFormatted = parseFloat(LPTokens) / 1000000000000000000
        setLPTokens(LPTokensFormatted)
        if (dexDisplayed) {
            ethToTokensBoughtCalculation()

            let tokensExpected = await ethToTokenView()
            let tokensExpectedFormatted = tokensExpected / 1000000000000000000
            setExpectedTokenAmount(tokensExpectedFormatted)
        } else {
            let ethExpected = await tokenToEthView()
            let ethExpectedFormatted = ethExpected / 1000000000000000000
            setexpectedEthAmount(ethExpectedFormatted)
        }
    }

    useEffect(() => {
        if (tokenAmount > tokensApproved) {
            setTokensToApproveExchange(tokenAmount)
        } else {
            setTokensToApproveExchange(0)
        }

        if (/^\d+\.*(\d+)*$/.test(depositTokenAmount)) {
            updateDepositTokensCalculation()
        } else {
            console.log("incorrect input")
        }
        if (/^\d+\.*(\d+)*$/.test(tokenAmount)) {
            updateExpecteds() ///////////////tokenAmount desync
        } else {
            console.log("incorrect input expecteds")
        }
    }, [
        tokenAmount,
        isWeb3Enabled,
        depositEthAmount,
        expectedEthAmount,
        expectedTokenAmount,
        tokenAmountToApproveFinal,
        withdrawAmount,
        tokensToApproveExchange,
    ])

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled, tokensApproved, depositEthAmount])

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
    ////ETH to TOKEN
    const exchangeEthToToken = () => {
        if (tokenAmount > 0) {
            ethToToken({
                onError: (error) => {
                    console.log(error)
                },
                onSuccess: (tx) => handleEthToTokenSuccess(tx),
            })
        }
    }
    const handleEthToTokenSuccess = () => {
        dispatch({
            type: "success",
            message: "Transaction sent - wait for transaction confirmation and refresh the page",
            title: "ETH to Token Exchanged",
            position: "topR",
        })
    }
    //////////DEPOSIT//////////////////////////
    const handleDepositClick = () => {
        console.log("handledepositclick")
        depositLiquidity()
    }
    async function depositLiquidity() {
        await deposit({
            onError: (error) => console.log(error),
            onSuccess: handleDepositSuccess,
        })
    }
    const handleDepositSuccess = () => {
        dispatch({
            type: "success",
            message: "Liquidity Provided - wait for transaction confirmation and refresh the page",
            title: "Liquidity provided",
            position: "topR",
        })
    }
    ///APPROVE DEPOSIT//////////////////////////////
    const handleApproveClick = () => {
        approveDepositClick()
    }
    async function approveDepositClick() {
        await approveDeposit({
            onError: (error) => console.log(error),
            onSuccess: handleApproveDepositSuccess,
        })
    }
    const handleApproveDepositSuccess = () => {
        dispatch({
            type: "success",
            message: "Tokens Approved - please refresh page",
            title: "Tokens Approved",
            position: "topR",
        })
    }
    /////////////////////////////////////////////
    //Withdraw
    /////////////////////////////////////////////
    const handleWithdrawClick = () => {
        withdrawLiquidity()
    }
    async function withdrawLiquidity() {
        await withdraw({
            onError: (error) => console.log(error),
            onSuccess: handleWithdrawSuccess,
        })
    }
    const handleWithdrawSuccess = () => {
        dispatch({
            type: "success",
            message: "Liquidity Withdrawn - wait for transaction confirmation and refresh the page",
            title: "Liquidity Withdrawn",
            position: "topR",
        })
    }
    ///////////////////////////////////////////////////////
    const handleExchangeEthToTokenClick = () => {
        exchangeEthToToken()
    }
    /////////////////////APPROVE EXCHANGE//////////
    const handleExchangeApproveClick = () => {
        console.log(tokenAmount)
        console.log(tokensApproved)
        console.log(tokensToApproveExchange)
        approveExchangeClick()
    }
    async function approveExchangeClick() {
        await approveExchange({
            onError: (error) => console.log(error),
            onSuccess: handleApproveExchangeSuccess,
        })
    }
    const handleApproveExchangeSuccess = () => {
        dispatch({
            type: "success",
            message: "Tokens Approved - please refresh page",
            title: "Tokens Approved",
            position: "topR",
        })
    }
    //////////////////////////////////////
    //////HANDLE EXCHANGE TOKEN TO ETH CLICK
    const handleExchangeTokenToEth = () => {
        exchangeTokenToEth()
    }
    async function exchangeTokenToEth() {
        await tokenToEth({
            onError: (error) => console.log(error),
            onSuccess: handleExchangeTokenToEthSuccess,
        })
    }
    const handleExchangeTokenToEthSuccess = () => {
        dispatch({
            type: "success",
            message: "Tokens Approved - please refresh page",
            title: "Tokens Approved",
            position: "topR",
        })
    }

    ///////////////////////////
    const handleEthToTokenClick = () => {
        setDexDisplayed(1)
    }
    const handleTokenToEthClick = () => {
        setDexDisplayed(0)
    }
    /////////////////////////
    const handleBarClick = () => {
        setReservesDisplayed(1)
    }
    const handleGraphClick = () => {
        setReservesDisplayed(0)
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
        contractAddress: DEXTokenAddress,
        functionName: "allowance",
        params: {
            _owner: account,
            _spender: DexAddress,
        },
    })
    const { runContractFunction: balanceOf } = useWeb3Contract({
        abi: LPTokenabi,
        contractAddress: LPTokenAddress,
        functionName: "balanceOf",
        params: {
            account: account,
        },
    })
    const { runContractFunction: approveDeposit } = useWeb3Contract({
        abi: WETHabi,
        contractAddress: DEXTokenAddress,
        functionName: "approve",
        params: {
            guy: DexAddress,
            wad: ethers.utils.parseEther(tokenAmountToApproveFinal.toString()),
        },
    })
    const { runContractFunction: deposit } = useWeb3Contract({
        abi: DexABI,
        contractAddress: DexAddress,
        functionName: "deposit",
        msgValue: depositEthAmount ? ethers.utils.parseEther(depositEthAmount.toString()) : "0",
        params: {},
    })
    const { runContractFunction: withdraw } = useWeb3Contract({
        abi: DexABI,
        contractAddress: DexAddress,
        functionName: "withdraw",

        params: { amount: ethers.utils.parseEther(withdrawAmount.toString()) },
    })
    const { runContractFunction: approveExchange } = useWeb3Contract({
        abi: WETHabi,
        contractAddress: DEXTokenAddress,
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
        msgValue: ethers.utils.parseEther(tokenAmount.toString()),
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
            msgValue: ethers.utils.parseEther(tokenAmount.toString()),
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
        <div className="container min-h-screen w-screen py-4">
            {isWeb3Enabled && chainString != 5 ? (
                <h1 className="py-10 px-4 font-bold text-3xl  min-h-full  text-white">
                    "Please connect to the Göerli testnet"
                </h1>
            ) : (
                ""
            )}

            <div className="  flex justify-between min-w-full max-h-fit">
                {isWeb3Enabled ? (
                    chainString == 5 ? (
                        <div className=" basis-1/3  sm ml-12  ">
                            <div className="container w-80">
                                {showExp ? (
                                    <div></div>
                                ) : dexDisplayed ? (
                                    <div>
                                        <ul class="flex">
                                            <li class="mr-3 py-1">
                                                <a
                                                    class="inline-block border border-fuchsia-600 rounded py-1 px-3 bg-fuchsia-600 text-white"
                                                    href="#"
                                                >
                                                    Eth to Tokens
                                                </a>
                                            </li>
                                            <li class="mr-3 py-1">
                                                <button
                                                    onClick={handleTokenToEthClick}
                                                    class="inline-block border border-white rounded bg-white hover:border-gray-200 text-fuchsia-700 hover:bg-gray-200 py-1 px-3"
                                                    href="#"
                                                >
                                                    Tokens to Eth
                                                </button>
                                            </li>
                                        </ul>
                                        <DexV1EthToToken
                                            onClick={handleExchangeEthToTokenClick}
                                            setTokenAmount={setTokenAmount}
                                            tokenAmount={tokenAmount}
                                            expectedTokens={expectedTokenAmount}
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <ul class="flex">
                                            <li class="mr-3 py-1">
                                                <button
                                                    onClick={handleEthToTokenClick}
                                                    class="inline-block border border-white bg-white rounded hover:border-gray-200 text-fuchsia-700 hover:bg-gray-200 py-1 px-3"
                                                    href="#"
                                                >
                                                    Eth to Tokens
                                                </button>
                                            </li>
                                            <li class="mr-3 py-1">
                                                <a
                                                    class="inline-block border border-fuchsia-600 rounded py-1 px-3 bg-fuchsia-600 text-white"
                                                    href="#"
                                                >
                                                    Tokens to Eth
                                                </a>
                                            </li>
                                        </ul>
                                        <DexV1TokenToEth
                                            setTokenAmount={setTokenAmount}
                                            tokenAmount={tokenAmount}
                                            expectedEth={expectedEthAmount}
                                            onExchangeApproveClick={handleExchangeApproveClick}
                                            tokensToApproveExchange={tokensToApproveExchange}
                                            onExchangeTokenToEthClick={handleExchangeTokenToEth}
                                            tokensApproved={tokensApproved}
                                            setTokensToApproveExchange={setTokensToApproveExchange}
                                        />
                                    </div>
                                )}
                            </div>{" "}
                            {showExp ? (
                                <div></div>
                            ) : (
                                <div className="flex justify-left w-70">
                                    <button
                                        onClick={() => setShowExp(1)}
                                        class="inline-block border hover:bg-fuchsia-800 border-fuchsia-500 rounded py-1 px-3 bg-fuchsia-500 text-white"
                                        href="#"
                                    >
                                        What is this and how does it work?
                                    </button>
                                </div>
                            )}
                            <Explanation
                                ethReserves={EthReserves}
                                tokenReserves={TokenReserves}
                                showExp={showExp}
                                setShowExp={setShowExp}
                                DexAddress={DexAddress}
                            />
                        </div>
                    ) : (
                        <div className="py-4 px-4 font-mono"> </div>
                    )
                ) : (
                    <div class="font-mono text-xl text-white m-16">
                        {" "}
                        Web3 currently not enabled, please connect your wallet
                    </div>
                )}
                {!showExp ? (
                    isWeb3Enabled ? (
                        chainString == 5 ? (
                            <div className="justify-center  ml-5 pr-5 basis-3/5">
                                <div className="container">
                                    {reservesDisplayed ? (
                                        <div>
                                            <ul class="flex">
                                                <li class="mr-3 py-1">
                                                    <a
                                                        class="inline-block border border-fuchsia-600 rounded py-1 px-3 bg-fuchsia-600 text-white"
                                                        href="#"
                                                    >
                                                        Bar chart
                                                    </a>
                                                </li>
                                                <li class="mr-3 py-1">
                                                    <button
                                                        onClick={handleGraphClick}
                                                        class="inline-block border border-white rounded bg-white  hover:border-gray-200 text-fuchsia-700 hover:bg-gray-200 py-1 px-3"
                                                        href="#"
                                                    >
                                                        Graph
                                                    </button>
                                                </li>
                                            </ul>
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
                                                tokenAmount={tokenAmount}
                                                dexDisplayed={dexDisplayed}
                                                expectedTokenAmount={expectedTokenAmount}
                                                expectedEthAmount={expectedEthAmount}
                                                withdrawClick={handleWithdrawClick}
                                                LPTokens={LPTokens}
                                                LPTokenAddress={LPTokenAddress}
                                                withdrawAmount={withdrawAmount}
                                                setWithdrawAmount={setWithdrawAmount}
                                            />
                                        </div>
                                    ) : (
                                        <div>
                                            <ul class="flex">
                                                <li class="mr-3 py-1">
                                                    <button
                                                        onClick={handleBarClick}
                                                        class="inline-block border border-white rounded bg-white hover:border-gray-200 text-fuchsia-700 hover:bg-gray-200 py-1 px-3"
                                                        href="#"
                                                    >
                                                        Bar chart
                                                    </button>
                                                </li>
                                                <li class="mr-3 py-1">
                                                    <a
                                                        class="inline-block border border-fuchsia-600 rounded py-1 px-3 bg-fuchsia-600 text-white"
                                                        href="#"
                                                    >
                                                        Graph
                                                    </a>
                                                </li>
                                            </ul>
                                            <Graph
                                                tokenReserves={TokenReserves}
                                                ethReserves={EthReserves}
                                                tokensApproved={tokensApproved}
                                                setDepositTokenAmount={setDepositTokenAmount}
                                                depositTokenAmount={depositTokenAmount}
                                                DexAddress={DexAddress}
                                                DEXTokenAddress={DEXTokenAddress}
                                                setDepositEthAmount={setDepositEthAmount}
                                                depositEthAmount={depositEthAmount}
                                                tokensToApprove={tokensToApprove}
                                                tokenAmount={tokenAmount}
                                                dexDisplayed={dexDisplayed}
                                                expectedTokenAmount={expectedTokenAmount}
                                                expectedEthAmount={expectedEthAmount}
                                                setTokenAmount={setTokenAmount}
                                                setDexDisplayed={setDexDisplayed}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="py-4 px-4 font-mono"> </div>
                        )
                    ) : (
                        <div class="font-mono"> </div>
                    )
                ) : (
                    <div></div>
                )}
            </div>
        </div>
    )
}
