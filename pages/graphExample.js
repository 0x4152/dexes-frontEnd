//yarn add @apollo/client
//yarn add graphql
import { useQuery, gql } from "@apollo/client"
//we can build the query on theGraph playground and add it after
const GET_ACTIVE_ITEMS = gql`
    {
        activeItems(first: 8, where: { buyer: "0x00000000" }) {
            id
            buyerseller
            nftAddress
            tokenId
            price
        }
    }
`
export default function GraphExample() {
    const { loading, error, data } = useQuery(GET_ACTIVE_ITEMS)
    console.log(data)
    return <div>hi</div>
}
