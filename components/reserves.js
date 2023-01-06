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

    onDepositClick,
    tokensApproved,
    onApproveClick,
    setDepositEthAmount,
    depositEthAmount,
    tokensToApprove,
    expectedEthAmount,
    expectedTokenAmount,
}) {
    const { isWeb3Enabled, chainId, account } = useMoralis()
    const [data, setData] = useState({
        labels: ["ETH reserves", "YEAH reserves"],
        datasets: [{ label: "Tokens", data: [ethReserves, tokenReserves] }],
        backgroundColor: ["red"],
    })
    const [showAlertDeposit, setShowAlertDeposit] = useState(false)
    function handleDepositChange(e) {
        if (/^\d+\.*(\d+)*$/.test(e.target.value)) {
            if (tokensApproved >= tokensToApprove) {
                setShowAlertDeposit(false)
            }
            setDepositEthAmount(e.target.value)
        } else if (e.target.value == "") {
            setDepositEthAmount(1)
        }
    }
    useEffect(() => {
        if (dexDisplayed) {
            //ethToToken
            console.log("eth to token")
            console.log(expectedTokenAmount)
            setData({
                labels: [
                    "ETH reserves after trade",
                    "ETH exchanged",
                    "YEAH reserves after trade",
                    "YEAH tokens returned",
                ],
                datasets: [
                    {
                        label: "Tokens",
                        data: [
                            parseFloat(ethReserves) + parseFloat(tokenAmount),
                            parseFloat(tokenAmount),
                            parseFloat(tokenReserves) - parseFloat(expectedTokenAmount),
                            expectedTokenAmount,
                        ],
                    },
                ],
                backgroundColor: ["red", "blue"],
            })
        } else {
            //tokenToEth
            console.log(" token to eth")
            setData({
                labels: [
                    "ETH reserves after trade",
                    "ETH returned",
                    "YEAH reserves after trade",
                    "YEAH Tokens exchanged",
                ],
                datasets: [
                    {
                        label: "Tokens",
                        data: [
                            parseFloat(ethReserves) - parseFloat(expectedEthAmount),
                            parseFloat(expectedEthAmount),
                            parseFloat(tokenReserves) + parseFloat(tokenAmount),
                            parseFloat(tokenAmount),
                        ],
                    },
                ],
                backgroundColor: ["red", "blue"],
            })
        }
    }, [tokenAmount])
    useEffect(() => {
        setData({
            labels: ["ETH reserves", "YEAH reserves"],
            datasets: [{ label: "Tokens", data: [ethReserves, tokenReserves] }],
            backgroundColor: ["red", "blue"],
        })
    }, [ethReserves, tokenReserves])
    return (
        <div>
            <div className="w-full max-w-xl hover:bg-slate-300">
                <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <div className="mb-4">
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            for="username"
                        >
                            ETH / YEAH liquidity pool
                        </label>
                    </div>
                    <div className="mb-4 p-2 px-4">
                        <Bar data={data} />
                        <div className="m-2">{ethReserves} eth</div>
                        <div className="m-2">{tokenReserves} yeah</div>
                        <div className="flex items-center justify-between m-2"></div>{" "}
                        <div className="">
                            <label
                                className="block text-gray-700 text-sm font-bold mb-2"
                                for="username"
                            >
                                Deposit Liquidity
                            </label>
                            {tokensApproved ? (
                                tokensApproved >= tokensToApprove ? (
                                    <Alert severity="success">
                                        You <strong>{tokensApproved} YEAH </strong>approved, enough
                                        for the ETH quantity you want to deposit
                                    </Alert>
                                ) : (
                                    <div>
                                        <Alert severity="warning">
                                            You have {tokensApproved} YEAH approved, not enough for
                                            the ETH quantity you want to deposit, you will need to
                                            approve
                                            <strong> {tokensToApprove} </strong>
                                            YEAH tokens to deposit
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
                                                to manipulate
                                                <strong>{tokensToApprove}</strong>
                                                YEAH tokens from your account.
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
                                        manipulate <strong>{tokensToApprove} YEAH tokens </strong>
                                        from your account.
                                    </p>
                                </Alert>
                            )}

                            <div className="flex">
                                <input
                                    onChange={handleDepositChange}
                                    value={depositEthAmount ? depositEthAmount : ""}
                                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="username"
                                    type="text"
                                    placeholder="0.0"
                                />
                                {tokensApproved >= tokensToApprove && tokensApproved > 0 ? (
                                    <button
                                        onClick={onDepositClick}
                                        class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
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
                                <button
                                    onClick={onApproveClick}
                                    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                    type="button"
                                >
                                    Approve
                                </button>
                            </div>
                        </div>
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
        </div>
    )
}
