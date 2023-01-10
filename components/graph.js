import { useState, useEffect } from "react"
import { Input, Modal, useNotification, Card } from "web3uikit"
import { Alert } from "@mui/material"
import { Scatter } from "react-chartjs-2"
import { Chart as ChartJS } from "chart.js/auto"

import { useWeb3Contract, useMoralis } from "react-moralis"
import { ethers } from "ethers"
export default function Graph({
    tokenAmount,
    dexDisplayed,
    ethReserves,
    tokenReserves,

    tokensApproved,
    onApproveClick,
    setDepositEthAmount,
    depositEthAmount,
    tokensToApprove,
    expectedEthAmount,
    expectedTokenAmount,
    DexAddress,
}) {
    const { isWeb3Enabled, chainId, account } = useMoralis()
    const [graphData, setGraphData] = useState(0)
    const [pointData, setPointData] = useState({ x: 0, y: 0 })
    const [data, setData] = useState({
        labels: ["ETH reserves", "YEAH reserves"],
        datasets: [{ label: "Tokens", data: [ethReserves, tokenReserves] }],
        backgroundColor: ["red"],
    })
    const [showAlertDeposit, setShowAlertDeposit] = useState(false)
    async function buyPointCalculation() {
        if (dexDisplayed) {
            //eth to token
        } else {
            //token to eth
        }
        let tokenBalance = tokenReserves
        let ethBalance = 0

        let product = tokenReserves * ethReserves
        for (let i = 0; i < 100; i++) {
            console.log(ethBalance)
            if (parseFloat(ethBalance).toFixed(2) != parseFloat(Number(ethReserves).toFixed(2))) {
                let yeahBalance = product / ethBalance
                results.push({
                    x: ethBalance,
                    y: yeahBalance,
                })
            }

            ethBalance += 0.01
        }
        setPointData(results)
        console.log(results)
    }
    async function graphCalculation() {
        let results = []
        let tokenBalance = tokenReserves
        let ethBalance = 0

        let product = tokenReserves * ethReserves
        for (let i = 0; i < 100; i++) {
            console.log(ethBalance)
            if (parseFloat(ethBalance).toFixed(2) != parseFloat(Number(ethReserves).toFixed(2))) {
                let yeahBalance = product / ethBalance
                results.push({
                    x: ethBalance,
                    y: yeahBalance,
                })
            }

            ethBalance += 0.01
        }
        setGraphData(results)
        console.log(results)
    }

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
        graphCalculation()
        if (dexDisplayed) {
            //ethToToken

            setData({
                datasets: [
                    {
                        type: "scatter",
                        label: "ETH / YEAH balances",
                        data: graphData,
                        backgroundColor: ["rgb(180, 147, 245)"],
                    },
                    {
                        type: "scatter",
                        label: "current reserves",
                        data: [{ x: ethReserves, y: tokenReserves }],
                        backgroundColor: ["red"],
                    },
                ],
            })
        } else {
            //tokenToEth
            setData({
                datasets: [
                    {
                        type: "scatter",
                        label: "ETH / YEAH balances",
                        data: graphData,
                        backgroundColor: ["rgb(180, 147, 245)"],
                    },
                    {
                        type: "scatter",
                        label: "current reserves",
                        data: [{ x: ethReserves, y: tokenReserves }],
                        backgroundColor: ["red"],
                    },
                ],
            })
        }
    }, [tokenAmount])
    useEffect(() => {
        graphCalculation()
        console.log(graphData[0])
    }, [])

    return (
        <div>
            <div className="w-full max-w-xxl hover:bg-slate-300">
                <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <div className="mb-4">
                        <label
                            className="block text-gray-700 text-xl font-bold mb-2"
                            for="username"
                        >
                            ETH / YEAH liquidity pool
                        </label>{" "}
                        <div className="m-2 font-bold text-gray-400">
                            Current Reserves: {parseFloat(Number(ethReserves).toFixed(5))} ETH/
                            {parseFloat(Number(tokenReserves).toFixed(5))} YEAH
                        </div>
                    </div>
                    <div className="mb-4 p-2 px-4">
                        <Scatter data={data} />
                        <div className="flex items-center justify-between m-2"></div>{" "}
                        <div className=""></div>
                    </div>
                    <p className="text-center text-gray-500 text-xs"></p>
                </form>
            </div>
        </div>
    )
}
