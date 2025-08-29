import "dotenv/config"
import { Agent, run  , tool} from "@openai/agents";
import {z} from "zod"

const getCurrentTime = tool({
    name:'get_current_time',
    description:`This tool returns the current time`,
    parameters:z.object({}),
    async execute(){
        return new Date().toString()
    }
})

const getMenuTool = tool({
    name:'get_menu',
    description:`this tool returns the menu of the food `,
    parameters:z.object({}),
    async execute(){
         return {
            Drinks:{
                Chai:'INR 50',
                Coffee:'INR 70'
            },
            Veg:{
                DalMakhni:'INR 250',
                Paneer:'INT 400'
            }
         }
    }
})
const codingAgent = new Agent({
    name:'Coding Agent',
    instructions:`
    You are an expert coding assistant particullarly in javascript`
})


const cookingAgent = new Agent({
    name:'Cooking Agent',
    tools:[getCurrentTime , getMenuTool],
    instructions:`
    You're a helpfull cooking agent assistant who is specialiZed in cooking food.
    You help the users with food options and receipes and help them cook food.
    ` 
})

const getewayAgent =  Agent.create({
    name:'Gateway Agent',
    instructions:'You determine which agent to use ',
    handoffs:[codingAgent , cookingAgent]
})

async function chatWithAgent(query) {
  const result = await run(cookingAgent , query)
  console.log(`History` , result.history)
  console.log (result.finalOutput)

}
chatWithAgent('what are funtions in js')