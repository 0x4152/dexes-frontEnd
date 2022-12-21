import Head from "next/head"
import Image from "next/image"
import styles from "../styles/Home.module.css"
import { Form, Card } from "web3uikit"
import { ethers } from "ethers"
import { useMoralis, useWeb3Contract } from "react-moralis"
import NFTABI from "../constants/BasicNft.json"
import NFTMarketABI from "../constants/NFTMarket.json"
import networkMapping from "../constants/networkMapping.json"
import { useNotification } from "web3uikit"
import { useState, useEffect } from "react"
export default function Home() {
    const [itemForSale, setItemForSale] = useState(false)
    const [sellNftState, setSellNftState] = useState({ nftAddress: 0, tokenId: 0, price: 0 })
    const [imageURI, setImageURI] = useState("")
    const [tokenName, setTokenName] = useState("")
    const [tokenDescription, setTokenDescription] = useState("")
    ///////////////////////////////////////////////
    //USENOTIFICATION
    ///////////////////////////////////////////////
    const dispatch = useNotification()
    ///////////////////////////////////////////////
    //MARKETPLACE ADDRESS SOURCING
    //chain Id from Moralis comes in HEX
    //////////////////////////////////////////
    const { chainId, isWeb3Enabled, account } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "1337"
    const marketplaceAddress = networkMapping[chainString]["NFTMarket"][0]
    /////////////////////////////////////////////////////////////////
    //APPROVE AND LIST CONTRACT CALL
    //when we hit the submit button on form, its going to automatically pass the data object to the function that is executed onSubmit.
    /////////////////////////////////////////////////////////////////
    //import { useMoralis, useWeb3Contract } from "react-moralis"
    //import { ethers } from "ethers"
    /////////////////////////////////////////////////////////////////
    const { runContractFunction } = useWeb3Contract()
    ////////////
    //APPROVE///
    ////////////
    const handleApproveSuccess = () => {
        console.log("hellyeah")
        setItemForSale(true)
        dispatch({
            type: "success",
            message: "Now click sell to put it on the market",
            title: "We recieved your approval",
            position: "topR",
        })
    }
    const approve = (data) => {
        console.log("approving...")
        const nftAddress = data.data[0].inputResult
        const tokenId = data.data[1].inputResult
        const price = ethers.utils.parseUnits(data.data[2].inputResult).toString()
        setSellNftState({ nftAddress: nftAddress, tokenId: tokenId, price: price })

        //This is a different way we can call runContractFunction from Moralis, where we set params on a separate object,

        const approveOptions = {
            abi: NFTABI,
            contractAddress: nftAddress,
            functionName: "approve",
            params: {
                to: marketplaceAddress,
                tokenId: tokenId,
            },
        }
        runContractFunction({
            params: approveOptions,
            onSuccess: handleApproveSuccess,
            onError: (error) => {
                console.log(error)
            },
        })
    }
    ////////////
    ///LIST/////
    ////////////
    //we create a separate function that will execute onSuccess of approval to our NFTMarket contract
    //it will execute the "listItem" function from our NFTMarket contract
    ////////////

    async function handleListItemCardClick() {
        console.log(`handleListItemCardClick  sellNFTstate address ${sellNftState.nftAddress}`)
        const listOptions = {
            abi: NFTMarketABI,
            contractAddress: marketplaceAddress,
            functionName: "listItem",
            params: {
                nftAddress: sellNftState.nftAddress,
                tokenId: sellNftState.tokenId,
                price: sellNftState.price,
            },
        }
        console.log("success, running contract function!")
        await runContractFunction({
            params: listOptions,
            onSuccess: () => handleListSuccess(),
            onError: (error) => {
                console.log(error)
            },
        })
    }
    //////////////////////////////////////////////////////////////
    //USENOTIFICATION
    //NotificationProvider around body, _app.js
    /////////////////////////////////////////////////////////////
    //import { useNotification } from "web3uikit"
    /////////////////////////////////////////////////////////////
    async function handleListSuccess() {
        dispatch({
            type: "success",
            message: "Item listed",
            title: "Item listed!",
            position: "topR",
        })
    }

    ////////////////////////////
    //Showing NFT to sell//
    ///////////////////////
    //This part of the code is in charge of rendering an image of the NFT once it has been approved to make sure it is
    //the correct NFT the user wanted to sell
    const { runContractFunction: getTokenURI } = useWeb3Contract({
        abi: NFTABI,
        contractAddress: sellNftState.nftAddress,
        functionName: "tokenURI",
        params: {
            tokenId: sellNftState.tokenId,
        },
    })

    async function updateUIAfterApproval() {
        const tokenURI = await getTokenURI()
        console.log(`token URI is : ${tokenURI}`)
        //ipfs gateway: everyone should be able to see the nfts
        if (tokenURI) {
            const requestURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
            const tokenURIResponse = await (await fetch(requestURL)).json() //first await to fetch the response JSON metadata object, await to .json it
            const imageURI = tokenURIResponse.image //we get the image tag from the json object
            const imageURIURL = imageURI.replace("ipfs://", "https://ipfs.io/ipfs/")
            setImageURI(imageURIURL)
            //this is not the best way to do it:
            //we could render the image on the moralis server, and just call the server
            // we could use moralis hooks: useNFTBalances() , but it only works on testnets and mainnet
            setTokenName(tokenURIResponse.name)
            setTokenDescription(tokenURIResponse.description)
        }
    }

    useEffect(() => {
        if (itemForSale) {
            updateUIAfterApproval()
            console.log(`rerendered from Sell page use effect, itemForSale ${itemForSale}`)
        }
    }, [itemForSale])

    /////////////////////////////////////////////////////////////
    //FORM
    //We use Web3uikit Form that already handles the work of tracking state and submitting to a function
    //when we hit the submit button on form, its going to automatically pass the data object to the function that is executed onSubmit.
    /////////////////////////////////////////////////////////////
    //import { Form } from "web3uikit"
    /////////////////////////////////////////////////////////////
    return (
        <div id="papa" class="block space-y-12 p-12 max-h-full content-center">
            <div id="son" class="flex justify-center space-x-24 max-h-full">
                <Form
                    className="p-12"
                    onSubmit={approve}
                    title="Sell your NFT!"
                    id="Main Form"
                    data={[
                        {
                            name: "NFT Address",
                            type: "text",
                            inputWidth: "50%",
                            value: "",
                            key: "nftAddress",
                        },
                        {
                            name: "Token ID",
                            type: "number",
                            value: "",
                            key: "tokenId",
                        },
                        {
                            name: "Price (int ETH)",
                            type: "number",
                            value: "",
                            key: "price",
                        },
                    ]}
                />
                <div class="flex h-100">
                    <div class="m-auto font-mono">
                        {itemForSale ? (
                            <div>
                                <Card
                                    title={tokenName}
                                    description={tokenDescription}
                                    onClick={handleListItemCardClick}
                                >
                                    <div className="p-7 ">
                                        <div className="flex flex-col items-end gap-2 font-mono">
                                            <div>#{sellNftState.tokenId}</div>
                                            <div className="italic text-sm font-mono">
                                                Owned by you
                                            </div>
                                            <Image
                                                loader={() => imageURI}
                                                src={imageURI}
                                                height="200"
                                                width="200"
                                            />
                                            <div className="fond-bold font-mono">
                                                {ethers.utils.formatUnits(
                                                    sellNftState.price,
                                                    "ether"
                                                )}{" "}
                                                ETH
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                                This is the NFT that will be up for sale, click on it to list it!
                            </div>
                        ) : (
                            <div class="align-middle font-mono bg-cyan-100 h-24 rounded-lg">
                                <div class="m-5 p-5">
                                    <p>Click submit to approve us to sell your NFT</p>
                                    <p>
                                        You will be able to see a preview of your NFT with the sale
                                        price
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
