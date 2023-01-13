import { useState, useEffect } from "react"
import { Input, Modal, useNotification, Card } from "web3uikit"
import { Alert } from "@mui/material"
import { Scatter } from "react-chartjs-2"
import { Chart as ChartJS } from "chart.js/auto"

import { useWeb3Contract, useMoralis } from "react-moralis"
import { ethers } from "ethers"
import { parse } from "graphql"
export default function Graph({
    tokenAmount,
    dexDisplayed,
    ethReserves,
    tokenReserves,
    expectedEthAmount,
}) {
    const [graphData, setGraphData] = useState(0)
    const [data, setData] = useState({
        datasets: [
            {
                type: "scatter",
                label: "Current Reserves",
                data: [
                    { x: 1, y: 1 },
                    { x: 1, y: 2 },
                    { x: 1, y: 3 },
                    { x: 1, y: 4 },
                    { x: 1, y: 5 },
                    { x: 1, y: 6 },
                    { x: 1, y: 7 },
                    { x: 1, y: 8 },
                    { x: 2, y: 8 },
                    { x: 3, y: 7 },
                    { x: 3, y: 6 },
                    { x: 3, y: 5 },
                    { x: 3, y: 4 },
                    { x: 3, y: 3 },
                    { x: 3, y: 2 },
                    { x: 2, y: 1 },
                ],
                backgroundColor: ["red"],
            },
            {
                type: "scatter",
                label: "Reserves after transaction",
                data: [
                    { x: 4, y: 1 },
                    { x: 4, y: 2 },
                    { x: 4, y: 3 },
                    { x: 4, y: 4 },
                    { x: 4, y: 5 },
                    { x: 4, y: 6 },
                    { x: 4, y: 7 },
                    { x: 4, y: 8 },
                    { x: 5, y: 1 },
                    { x: 6, y: 1 },
                    { x: 5, y: 5 },
                    { x: 6, y: 5 },
                    { x: 5, y: 8 },
                    { x: 6, y: 8 },
                ],
                backgroundColor: ["green"],
            },
            {
                type: "scatter",
                label: "possible ETH / YEAH Reserves",
                data: [
                    { x: 7, y: 1 },
                    { x: 8, y: 2 },
                    { x: 9, y: 3 },
                    { x: 10, y: 4 },
                    { x: 11, y: 5 },
                    { x: 7, y: 5 },
                    { x: 8, y: 4 },
                    { x: 10, y: 2 },
                    { x: 11, y: 1 },
                ],
                backgroundColor: ["rgb(188, 191, 188)"],
            },
        ],
    })

    async function buyPointCalculation() {
        //calcular una grafica en base a la diferencia entre las reservas actuales y las finales, para que haya margen para ver cuanto cambia
        let results
        let ethBalance = 0

        let product = parseFloat(tokenReserves) * parseFloat(ethReserves)
        let pointData
        if (dexDisplayed) {
            //eth to token
            ethBalance = parseFloat(ethReserves) + parseFloat(tokenAmount)

            let yeahBalance = product / parseFloat(ethBalance)
            pointData = { x: ethBalance, y: yeahBalance }
        } else {
            //token to eth
            let tokenBalance = parseFloat(tokenReserves) + parseFloat(tokenAmount)
            ethBalance = product / parseFloat(tokenBalance)
            pointData = { x: ethBalance, y: tokenBalance }
        }

        if (dexDisplayed) {
            //ethToToken
            results = []
            //proportions of graph calculation based on the Reserves after transaction
            let increments
            let decimals
            if (tokenAmount > 5) {
                increments = 1
                decimals = 0
            } else if (tokenAmount > 0.5) {
                increments = 0.1
                decimals = 1
            } else if (tokenAmount > 0.05) {
                increments = 0.01
                decimals = 2
            } else if (tokenAmount > 0.005) {
                increments = 0.001
                decimals = 3
            } else {
                increments = 0.0001
                decimals = 4
            }

            //Calculate lowest value to set a graph that shows a minimum and a maximum based on those values.
            //When exchaning eth for tokens, since we are adding eth to the reserves in exchange for tokens, ethReserves is always going
            //to be the lowest value. The contrary will be the case when exchaning tokens for eth
            let lowestValue = ethReserves

            // The graph has to give some perspective on the trade, to do so it has to show a certain amount of possible
            //balances before and after the points that are involved in the trade. To calculate exactly what range to show
            // a reasonable figure would be the same on each side than the distance between the two points, that being the amount of ETH exchanged,
            // represented by the variable tokenAmount.
            //                      1                 2                    3
            //(starting point)----------(point A)++++++++++(point B)----------(ending point)
            //                                   token amount

            //since the distance is best understood on increments, with the range calculation we multiply the token amount by 3
            //to get the total distance, and to get the total amount of increments we divide it by the increment value.
            //after this we calculate where the starting value is by subtracting 1 token amount to the lowest value(point A)
            let range = parseInt((tokenAmount / increments) * 3)
            let startingPoint =
                parseFloat(lowestValue).toFixed(decimals) -
                parseFloat(tokenAmount).toFixed(decimals)
            //to simplify, if the starting point is below 0, the graph starts at 0. It will be off to the right side but it shouldnt be a problem.
            if (startingPoint < 0) {
                startingPoint = 0
            }
            let product = tokenReserves * ethReserves
            let ethBalance = startingPoint
            for (let i = startingPoint; i < range; i++) {
                let yeahBalance = product / ethBalance
                results.push({
                    x: ethBalance,
                    y: yeahBalance,
                })

                ethBalance += increments
            }
            setGraphData(results)
        } else {
            //same calculation than when exchanging eth to tokens, but this time tokenAmount represents the amount of YEAH tokens exchanged.
            //The value that we are interested in is the ETH amount that we will recieve, the distance between the two points
            //that represent the initial reserves and the reserves after the trade
            results = []
            //proportions of graph calculation based on the Reserves after transaction
            let increments
            let decimals
            if (expectedEthAmount > 5) {
                increments = 1
                decimals = 0
            } else if (expectedEthAmount > 0.5 || expectedEthAmount == 0) {
                increments = 0.1
                decimals = 1
            } else if (expectedEthAmount > 0.05) {
                increments = 0.01
                decimals = 2
            } else if (expectedEthAmount > 0.005) {
                increments = 0.001
                decimals = 3
            } else {
                increments = 0.0001
                decimals = 4
            }

            //Calculate lowest value to set a graph that shows a minimum and a maximum based on those values.
            let lowestValue = pointData.x

            // The graph has to give some perspective on the trade, to do so it has to show a certain amount of possible
            //balances before and after the points that are involved in the trade. To calculate exactly what range to show
            // a reasonable figure would be the same on each side than the distance between the two points, that being the ethAmount that is exchanged,
            //which equates to the variable expectedEthAmount.
            //                      1                 2                    3
            //(starting point)----------(point A)++++++++++(point B)----------(ending point)
            //                                   eth amount

            //since the distance is best understood on increments, with the range calculation we multiply the token amount by 3
            //to get the total distance, and to get the total amount of increments we divide it by the increment value.
            //after this we calculate where the starting value is by subtracting 1 token amount to the lowest value(point A)
            let range = expectedEthAmount ? parseInt((expectedEthAmount / increments) * 3) : 30
            let startingPoint =
                parseFloat(lowestValue).toFixed(decimals) -
                parseFloat(expectedEthAmount).toFixed(decimals)
            console.log(expectedEthAmount)
            //to simplify, if the starting point is below 0, the graph starts at 0. It will be off to the right side but it shouldnt be a problem.
            if (startingPoint < 0 || expectedEthAmount == 0) {
                startingPoint = 0
            }
            let product = tokenReserves * ethReserves
            let ethBalance = startingPoint
            for (let i = startingPoint; i < range; i++) {
                console.log("he")
                let yeahBalance = product / ethBalance
                results.push({
                    x: ethBalance,
                    y: yeahBalance,
                })

                ethBalance += increments
            }
        }
        setData({
            datasets: [
                {
                    type: "scatter",
                    label: "Current Reserves",
                    data: [{ x: ethReserves, y: tokenReserves }],
                    backgroundColor: ["red"],
                },
                {
                    type: "scatter",
                    label: "Reserves after transaction",
                    data: [pointData],
                    backgroundColor: ["green"],
                },
                {
                    type: "scatter",
                    label: "possible ETH / YEAH Reserves",
                    data: results,
                    backgroundColor: ["rgb(188, 191, 188)"],
                },
            ],
        })
    }

    useEffect(() => {
        console.log("useEffect")
        buyPointCalculation()
    }, [tokenAmount])

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
