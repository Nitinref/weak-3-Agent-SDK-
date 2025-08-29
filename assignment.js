import "dotenv/config"
import { chromium } from "playwright"
import { Agent, run, tool } from "@openai/agents"
import { z } from "zod"
import CDP from "chrome-remote-interface";

if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set in the environment variables. Please add it to your .env file.");
}

const messages = []
export async function automation() {

    const browser = await chromium.launch({
        headless: false,
        args: ["--remote-debugging-port=9222"]
    })

    const page = await browser.newPage();
    const client = await CDP({ port: 9222 });
    await client.Page.enable();

   

    const getPageContent = tool({
        name: "get_page_content",
        description: "Gets a simplified summary of the interactive elements on the current page, such as links, buttons, and inputs. This should be used to find the correct CSS selectors for other tools.",
        parameters: z.object({}),
        async execute() {
            try {
                const interactiveElements = await page.$$eval('a, button, input, [role="button"], [role="link"]', (elements) =>
                    elements
                    .filter(el => el.offsetParent !== null) 
                    .map(el => {
                        let selector = el.tagName.toLowerCase();
                        if (el.id) {
                            selector = `#${el.id}`;
                        } else if (el.className && typeof el.className === 'string') {
                            // Create a selector from the first class name that is not empty
                            const firstClass = el.className.split(' ').find(c => c);
                            if (firstClass) {
                                selector = `.${firstClass}`;
                            }
                        }
                        const text = el.textContent.trim().slice(0, 100); // Get first 100 chars of text
                        return `<${el.tagName.toLowerCase()} selector="${selector}">${text}</${el.tagName.toLowerCase()}>`;
                    })
                );
                const summary = interactiveElements.join('\n');
                messages.push({ step: "Retrieved simplified page content." });
                if (!summary) return "No interactive elements found on the page."
                return `Here are the interactive elements on the page:\n${summary}`;
            } catch (err) {
                return `Failed to get page content: ${err.message}`;
            }
        }
    });

    const clickSelector = tool({
        name: "click_selector",
        description: "Clicks on an element that matches the given CSS selector.",
        parameters: z.object({
            selector: z.string().describe("The CSS selector of the element to click (e.g., '#login-button', 'a.product-link')."),
        }),
        async execute({ selector }) {
            try {
                await page.click(selector);
                messages.push({ step: `Clicked on element with selector: "${selector}"` });
                return `Successfully clicked on element: "${selector}"`;
            } catch (err) {
                return `Failed to click on selector "${selector}": ${err.message}`;
            }
        }
    });

    const typeInSelector = tool({
        name: "type_in_selector",
        description: "Types text into an element that matches the given CSS selector.",
        parameters: z.object({
            selector: z.string().describe("The CSS selector of the input element (e.g., '#username', 'input[name=\"query\"]')."),
            text: z.string().describe("The text to type into the element."),
        }),
        async execute({ selector, text }) {
            try {
                await page.fill(selector, text);
                messages.push({ step: `Typed "${text}" into element with selector "${selector}"` });
                return `Successfully typed text into element: "${selector}"`;
            } catch (err) {
                return `Failed to type into selector "${selector}": ${err.message}`;
            }
        }
    });

    const navigateUrl = tool({
        name: "navigate_url",
        description: "Navigate to a given URL.",
        parameters: z.object({
            url: z.string().describe("The full URL to navigate to, including 'https://'."),
        }),
        async execute({ url }) {
            try {
                await page.goto(url, { waitUntil: "domcontentloaded" });
                messages.push({ step: `Mapsd to ${url}` });
                return `Mapsd to ${url}`;
            } catch (err) {
                return `Failed to navigate to ${url}: ${err.message}`;
            }
        }
    });

    const takeScreenshot = tool({
        name: "take_screenshot",
        description: "Takes a screenshot of the current page and saves it to a file.",
        parameters: z.object({}),
        async execute() {
            const screenshotPath = `screenshot-${Date.now()}.png`;
            await page.screenshot({ path: screenshotPath });
            messages.push({ step: `Screenshot saved to ${screenshotPath}` });
            return `Screenshot saved successfully to ${screenshotPath}.`;
        }
    });

    const scrollPage = tool({
        name: "scroll_page",
        description: "Scrolls the page up or down to find elements that might be out of view.",
        parameters: z.object({
            direction: z.enum(["up", "down"]),
            amount: z.number().describe("The number of pixels to scroll. A good default is 500.")
        }),
        async execute({ direction, amount }) {
            const scrollValue = direction === "down" ? amount : -amount;
            await page.evaluate((scrollY) => {
                window.scrollBy(0, scrollY);
            }, scrollValue);
            messages.push({ step: `Scrolled ${direction} by ${amount}px` });
            return `Scrolled ${direction} by ${amount}px`;
        }
    });

    const websiteAutomationAgent = new Agent({
        name: 'Website Automation Agent',
        tools: [getPageContent, clickSelector, typeInSelector, navigateUrl, takeScreenshot, scrollPage],
        instructions: `
        You are a task-based browser automation agent.
        Your goal is to complete tasks on any given website.

        WORKFLOW:
        1.  **Navigate:** Use the 'navigate_url' tool to go to the website.
        2.  **Analyze:** Use the 'get_page_content' tool to get a summary of the interactive elements on the page. This is how you "see" the page.
        3.  **Scroll (If Needed):** If you cannot find the element you are looking for in the summary, use the 'scroll_page' tool to look further down or up the page, then Analyze again.
        4.  **Identify Selectors:** From the summary, identify the specific CSS selectors for the elements you need to interact with.
        5.  **Execute:** Use the 'type_in_selector' and 'click_selector' tools with the selectors you identified to perform the required actions.
        6.  **Confirm:** After completing the final task from the user's prompt, state that the task is complete. DO NOT ask what to do next.

        RULES:
        - Always analyze the page with 'get_page_content' before trying to click or type.
        - Be precise with CSS selectors. Use IDs (#) if available.
    `
    });


    async function chatWithAgent(query) {
        const result = await run(websiteAutomationAgent, query);
        console.log(`\n--- Agent History ---\n`, result.history);
        console.log("\n--- Final Output ---\n", result.finalOutput);
        console.log("\n--- Action Messages ---\n", messages);
        
        await browser.close();
    }

    return { chatWithAgent };
}