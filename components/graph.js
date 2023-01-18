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
    expectedTokenAmount,
    setTokenAmount,
    setDexDisplayed,
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
            if (expectedEthAmount > 5 || expectedEthAmount == 0) {
                increments = 1
                decimals = 0
            } else if (expectedEthAmount > 0.5) {
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
            console.log(increments)
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
            <div className=" max-w-15xl hover:bg-slate-300 font-mono">
                <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <div className="mb-4">
                        <label
                            className="block text-gray-700 text-3xl font-bold m-2"
                            for="username"
                        >
                            ETH / YEAH Liquidity Pool
                        </label>{" "}
                        <div className="m-2 font-bold text-gray-400">
                            Current Reserves: {parseFloat(Number(ethReserves).toFixed(5))} ETH/
                            {parseFloat(Number(tokenReserves).toFixed(5))} YEAH
                        </div>
                        {tokenAmount ? (
                            <>
                                {dexDisplayed ? (
                                    //eth to token
                                    <div>
                                        <div className="m-2 font-bold text-gray-400">
                                            Average Price of Eth bought:{" "}
                                            {parseFloat(Number(expectedTokenAmount).toFixed(5)) /
                                                parseFloat(Number(tokenAmount).toFixed(5))}{" "}
                                            ETH / YEAH
                                        </div>
                                    </div>
                                ) : (
                                    //token to eth
                                    <div>
                                        <div className="m-2 font-bold text-gray-400">
                                            Average Price of Eth bought:{" "}
                                            {parseFloat(Number(expectedEthAmount).toFixed(5)) /
                                                parseFloat(Number(tokenAmount).toFixed(5))}{" "}
                                            ETH / YEAH
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <></>
                        )}
                    </div>
                    <div className=" text-gray-700 text-xl font-bold mt-10 text-center ">
                        <p>Constant product Curve</p>X * Y = K
                    </div>
                    <div className="mb-4 ">
                        <div></div>
                        <div className="flex content-center justify-center align-middle items-center">
                            <div className="container content-center m-2 justify-center w-14">
                                <p className="container justtify-center text-center max-h-2 text-gray-500 text-xl m-3">
                                    YEAH
                                </p>
                            </div>
                            <Scatter data={data} />
                        </div>
                        <p className=" text-gray-500 text-center text-xl mb-10 ">ETH</p>
                        <p className=" text-gray-500 my-4 mx-3 ">
                            {" "}
                            This graph is a representation of the curve created by the constant
                            product formula, which describes all the possible ratios of ETH and YEAH
                            tokens the liquidity pool could have after an exchange transaction, and
                            therefore it gives us an idea of how prices change depending on the
                            amount of assets the pool holds compared to the amount of assets we are
                            adding to the pool.
                        </p>{" "}
                        {dexDisplayed ? (
                            <div>
                                {tokenAmount > 0 ? (
                                    <p className=" text-gray-500  ">
                                        <p className=" text-gray-500  m-3">
                                            {" "}
                                            We can see that by adding {tokenAmount} ETH to the pool
                                            we would be moving the ratio by {tokenAmount} on the X
                                            axis, and by doing so, to mantain the constant K in the
                                            constant product formula we would arrive to the Y value:{" "}
                                            {parseFloat(
                                                Number(tokenReserves - expectedTokenAmount).toFixed(
                                                    5
                                                )
                                            )}
                                            , that represents the YEAH token reserve after the
                                            transaction.
                                        </p>
                                        <p className=" text-gray-500  m-3">
                                            {" "}
                                            Having this new point that represents a ratio on the
                                            curve that respects the constant K, we can now calculate
                                            the difference of the Y value between the current
                                            reserves and the reserves after the transaction.{" "}
                                            {Number(expectedTokenAmount).toFixed(5)} is the amount
                                            of Tokens we have to take out of the reserves so that
                                            the ratio respects the constant.
                                        </p>
                                        <Alert severity="success">
                                            <p className="">
                                                Excellent! Now you should see a preview of trade
                                                consisting of {tokenAmount} ETH to YEAH{" "}
                                            </p>
                                        </Alert>
                                    </p>
                                ) : (
                                    <Alert severity="info">
                                        <p className="m-4">
                                            Try putting a ETH amount on the Eth to Tokens box!
                                        </p>
                                        <p className="m-4">
                                            This will draw a graph that previews the exchange for
                                            that amount
                                        </p>
                                    </Alert>
                                )}
                            </div>
                        ) : (
                            <div>
                                {tokenAmount > 0 ? (
                                    <p className=" text-gray-500  m-3">
                                        <p className=" text-gray-500  m-3">
                                            {" "}
                                            We can see that by adding {tokenAmount} YEAH to the pool
                                            we would be moving the ratio by {tokenAmount} on the Y
                                            axis, and by doing so, to mantain the constant K in the
                                            constant product formula we would arrive to the X value:{" "}
                                            {parseFloat(
                                                Number(ethReserves - expectedEthAmount).toFixed(5)
                                            )}
                                            , that represents the ETH reserves after the
                                            transaction.
                                        </p>
                                        <p className=" text-gray-500  m-3">
                                            {" "}
                                            Having this new point that represents a ratio on the
                                            curve that respects the constant K, we can now calculate
                                            the difference of the X value between the current
                                            reserves and the reserves after the transaction.{" "}
                                            {Number(expectedEthAmount).toFixed(5)} is the amount of
                                            ETH we have to take out of the reserves so that the
                                            ratio respects the constant.
                                        </p>
                                        <Alert severity="success">
                                            <p className="">
                                                Excellent! Now you should see a preview of trade
                                                consisting of {tokenAmount} YEAH to ETH{" "}
                                            </p>
                                        </Alert>
                                    </p>
                                ) : (
                                    <Alert severity="info">
                                        <p className="m-4">
                                            Try putting a YEAH amount on the Tokens to ETH box!
                                        </p>
                                        <p className="m-4">
                                            This will draw a graph that previews the exchange for
                                            that amount
                                        </p>
                                    </Alert>
                                )}
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}
