import { useState, useEffect } from "react"
import { Input, Modal, useNotification, Card } from "web3uikit"
import { Alert } from "@mui/material"
import { Bar } from "react-chartjs-2"
import { Chart as ChartJS } from "chart.js/auto"

import { useWeb3Contract, useMoralis } from "react-moralis"
import networkMapping from "../constants/networkMapping.json"
import DexABI from "../constants/DexV1abi.json"
import WETHabi from "../constants/WETHabi.json"
import WBTCabi from "../constants/WBTC.json"
import { ethers } from "ethers"
export default function Reserves({
    tokenAmount,
    dexDisplayed,
    ethReserves,
    tokenReserves,
    withdrawClick,
    onDepositClick,
    tokensApproved,
    onApproveClick,
    setDepositEthAmount,
    depositEthAmount,
    tokensToApprove,
    expectedEthAmount,
    expectedTokenAmount,
    LPTokens,
    LPTokenAddress,
    withdrawAmount,
    setWithdrawAmount,
}) {
    const { isWeb3Enabled, chainId, account } = useMoralis()
    const LPTokenAddressString = LPTokenAddress.toString()
    const url = "https://goerli.etherscan.io/address/" + LPTokenAddressString + ""
    const [data, setData] = useState({
        labels: ["ETH reserves", "DEX reserves"],
        datasets: [{ label: "Tokens", data: [ethReserves, tokenReserves] }],
        backgroundColor: ["red"],
    })

    const [showAlertDeposit, setShowAlertDeposit] = useState(false)
    const [showAlertWithdraw, setShowAlertWithdraw] = useState(false)
    function handleDepositChange(e) {
        if (/^\d+\.*(\d+)*$/.test(e.target.value)) {
            if (tokensApproved >= tokensToApprove) {
                setShowAlertDeposit(false)
            }
            setDepositEthAmount(e.target.value)
        } else if (e.target.value == "") {
            setDepositEthAmount(0)
        }
    }
    function handleWithdrawChange(e) {
        if (/^\d+\.*(\d+)*$/.test(e.target.value)) {
            if (LPTokens >= withdrawAmount) {
                setShowAlertWithdraw(false)
            }
            setWithdrawAmount(e.target.value)
        } else if (e.target.value == "") {
            setWithdrawAmount(0)
        }
    }
    useEffect(() => {
        if (dexDisplayed) {
            //ethToToken
            console.log("eth to token")
            console.log(expectedTokenAmount)
            setData({
                labels: [
                    "Current ETH reserves",
                    "ETH reserves after trade",
                    "ETH exchanged",
                    "Current DEX reserves",
                    "DEX reserves after trade",
                    "DEX tokens returned",
                ],
                datasets: [
                    {
                        label: "Tokens",
                        data: [
                            parseFloat(ethReserves),
                            parseFloat(ethReserves) + parseFloat(tokenAmount),
                            parseFloat(tokenAmount),
                            parseFloat(tokenReserves),
                            parseFloat(tokenReserves) - parseFloat(expectedTokenAmount),
                            expectedTokenAmount,
                        ],
                        backgroundColor: [
                            "rgb(180, 147, 245)",
                            "rgb(223, 182, 242)",
                            "rgb(232, 100, 97)",
                            "rgb(38, 28, 77)",
                            "rgb(44, 23, 120)",
                            "rgb(154, 252, 175)",
                        ],
                    },
                ],
            })
        } else {
            //tokenToEth
            console.log(" token to eth")
            setData({
                labels: [
                    "Current ETH reserves",
                    "ETH reserves after trade",
                    "ETH returned",
                    "Current DEX reserves",
                    "DEX reserves after trade",
                    "DEX Tokens exchanged",
                ],
                datasets: [
                    {
                        label: "Tokens",
                        data: [
                            parseFloat(ethReserves),
                            parseFloat(ethReserves) - parseFloat(expectedEthAmount),
                            parseFloat(expectedEthAmount),
                            parseFloat(tokenReserves),
                            parseFloat(tokenReserves) + parseFloat(tokenAmount),
                            parseFloat(tokenAmount),
                        ],
                        backgroundColor: [
                            "rgb(180, 147, 245)",
                            "rgb(223, 182, 242)",
                            "rgb(154, 252, 175)",
                            "rgb(38, 28, 77)",
                            "rgb(44, 23, 120)",
                            "rgb(232, 100, 97)",
                        ],
                    },
                ],
            })
        }
    }, [tokenAmount, expectedEthAmount, expectedTokenAmount])
    useEffect(() => {
        setData({
            labels: ["ETH reserves", "DEX reserves"],
            datasets: [
                {
                    label: ["Tokens"],
                    data: [ethReserves, tokenReserves],
                    backgroundColor: ["rgb(180, 147, 245)", "rgb(38, 28, 77)"],
                },
            ],
        })
    }, [ethReserves, tokenReserves])
    return (
        <div>
            <div className="w-full max-w-xl min-h-4xl hover:bg-slate-300">
                <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <div className="mb-4">
                        <label
                            className="block text-gray-700 text-xl font-bold mb-2"
                            for="username"
                        >
                            ETH / DEX liquidity pool
                        </label>{" "}
                        <div className="m-2 font-bold text-gray-400">
                            Current Reserves: {parseFloat(Number(ethReserves).toFixed(5))} ETH /
                            {" " + parseFloat(Number(tokenReserves).toFixed(5))} DEX
                        </div>
                    </div>
                    <div className="mb-4 p-2 px-4">
                        <Bar data={data} />
                        <div className="flex items-center justify-between m-2"></div>{" "}
                        <div className=""></div>
                        {showAlertDeposit ? (
                            <Alert severity="warning">
                                Not enough tokens approved, please approve more tokens
                            </Alert>
                        ) : (
                            ""
                        )}
                    </div>
                </form>
                <p className="text-center text-gray-500 text-xs"></p>
            </div>
            <div className="w-full max-w-xl min-h-4xl hover:bg-slate-300">
                <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <div className="mb-4">
                        <div className="flex items-center justify-between m-2"></div>{" "}
                        <div className="">
                            <label
                                className="block text-gray-700 text-xl font-bold mb-2"
                                for="username"
                            >
                                Deposit and Withdraw Liquidity
                            </label>
                            <label
                                className="block text-gray-500 text-m font-bold mb-2"
                                for="username"
                            >
                                You own {parseFloat(Number(LPTokens).toFixed(5))} LP tokens.
                            </label>{" "}
                            <p className="my-2 text-violet-500 hover:text-violet-800">
                                <a href={url}>LP token address: {LPTokenAddress}</a>
                            </p>
                            {tokensApproved ? (
                                tokensApproved >= tokensToApprove ? (
                                    <Alert severity="success">
                                        You <strong>{tokensApproved} DEX </strong>approved, enough
                                        for the ETH quantity you want to deposit
                                    </Alert>
                                ) : (
                                    <div>
                                        <Alert severity="warning">
                                            You have {tokensApproved} DEX approved, not enough for
                                            the ETH quantity you want to deposit, you will need to
                                            approve
                                            <strong> {tokensToApprove} </strong>
                                            DEX tokens to deposit{" "}
                                            <strong>{depositEthAmount} </strong>
                                            ETH
                                        </Alert>
                                        <Alert severity="info">
                                            <p className="m-4">
                                                This DApp calculates exactly how many tokens you
                                                will need to approve to deposit the ETH quantity you
                                                want to deposit.
                                            </p>
                                            <p className="m-4">
                                                Click on the approve button to approve this contract
                                                to manipulate <strong>{tokensToApprove}</strong> DEX
                                                tokens from your account.
                                            </p>
                                        </Alert>
                                    </div>
                                )
                            ) : (
                                <Alert severity="info">
                                    <p className="m-4">
                                        This DApp calculates exactly how many tokens you will need
                                        to approve to deposit
                                        <strong>
                                            {" " + depositEthAmount + " "}
                                            ETH.
                                        </strong>
                                    </p>

                                    <p className="m-4">
                                        Click on the approve button to approve this contract to
                                        manipulate <strong>{tokensToApprove} DEX tokens </strong>
                                        from your account.
                                    </p>
                                </Alert>
                            )}
                            <div className="flex my-2">
                                <input
                                    onChange={handleDepositChange}
                                    value={depositEthAmount ? depositEthAmount : ""}
                                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="username"
                                    type="text"
                                    placeholder="ETH amount to deposit"
                                />
                                <button
                                    onClick={onApproveClick}
                                    class="bg-violet-700 hover:bg-violet-900 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                    type="button"
                                >
                                    Approve
                                </button>
                                {tokensApproved >= tokensToApprove && tokensApproved > 0 ? (
                                    <button
                                        onClick={onDepositClick}
                                        class="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                        type="button"
                                    >
                                        Deposit
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setShowAlertDeposit(true)}
                                        class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                        type="button"
                                    >
                                        Deposit
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="flex my-2">
                            <input
                                onChange={handleWithdrawChange}
                                value={withdrawAmount ? withdrawAmount : ""}
                                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="username"
                                type="text"
                                placeholder="LP token amount to withdraw"
                            />

                            {LPTokens >= withdrawAmount ? (
                                <button
                                    onClick={withdrawClick}
                                    class="bg-violet-400 hover:bg-violet-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                    type="button"
                                >
                                    Withdraw
                                </button>
                            ) : (
                                <button
                                    onClick={() => setShowAlertWithdraw(true)}
                                    class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                    type="button"
                                >
                                    Withdraw
                                </button>
                            )}
                        </div>
                        {showAlertDeposit ? (
                            <Alert severity="warning">
                                Not enough tokens approved, please approve more tokens
                            </Alert>
                        ) : (
                            ""
                        )}
                        {showAlertWithdraw ? (
                            <Alert severity="warning">
                                You haven't got enough enough LP tokens, try something below{" "}
                                {parseFloat(Number(LPTokens).toFixed(5))}
                            </Alert>
                        ) : (
                            ""
                        )}
                    </div>
                </form>
                <p className="text-center text-gray-500 text-xs"></p>
            </div>
        </div>
    )
}
