import "dotenv/config"
import { z } from "zod";
import { Agent , tool , run } from "@openai/agents";

const get_current_time = tool({
    name:'get_current_time',
    description:'This tool returns the current time',
    parameters: z.object({
        userId:z.string()
    }),
    async execute(){
        return new Date().toString()
    }
})


const cookingAgent = new Agent({
    name:'cooking_Agent',
    instructions:'You are an cooking agent who gives the recipe of the dish',
    tools:[get_current_time]
})

async function execute(query) {
    const result = await run(cookingAgent , query)
    console.log(`History `, result.history) 
    console.log(result.finalOutput)
}

execute(`give me the recipe of cake `)