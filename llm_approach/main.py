import os
import asyncio
import json
from pydantic import BaseModel, Field
from typing import List
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig, CacheMode
from crawl4ai.extraction_strategy import LLMExtractionStrategy

class Product(BaseModel):
    name: str
    price: str

async def main():
    instruction = """
For the trips on the page, return a JSON object with only the **first five trips listed**. Each trip should include:
- 'price': The numerical value of the trip's price (exclude the currency symbol).
- 'currency': The currency of the price, ie USD, CAD, JPN, etc.
- 'outbound': An object with:
  - 'transfers': The number of transfers for the outbound trip.
  - 'length': The travel time for the outbound trip.
- 'inbound': An object with:
  - 'transfers': The number of transfers for the inbound trip.
  - 'length': The travel time for the inbound trip.

Do not include more than **five trips**. Only return exactly **five results** in your output. Return the ***five cheapest trips***"""

    link='https://www.travel.co.jp/flights/search/flight_list/?journey_type=return&outbounddate=20250217&inbounddate=20250220&adults=1&children=0&infants=0&cabinclass=Economy&origin_place=YEG&origin_type=airport&destination_place=PHL&destination_type=airport'
    
    # 1. Define the LLM extraction strategy
    llm_strategy = LLMExtractionStrategy(
        provider="deepseek/deepseek-chat",            # e.g. "ollama/llama2"
        api_token='',
        schema=Product.model_json_schema(),            # Or use model_json_schema()
        extraction_type="schema",
        instruction=instruction,
        chunk_token_threshold=1000,
        overlap_rate=0.0,
        apply_chunking=True,
        input_format="markdown",   # or "html", "fit_markdown"
        extra_args={"temperature": 0.0, "max_tokens": 800}
    )

    # 2. Build the crawler config
    crawl_config = CrawlerRunConfig(
        extraction_strategy=llm_strategy,
        cache_mode=CacheMode.BYPASS,
        page_timeout=60000,
        exclude_external_links=False,
        delay_before_return_html=5
    )

    # 3. Create a browser config if needed
    browser_cfg = BrowserConfig(headless=True,)

    async with AsyncWebCrawler(config=browser_cfg) as crawler:
        # 4. Let's say we want to crawl a single page
        result = await crawler.arun(
            url=link,
        )
        
        result = result.markdown[:30000]

        result = await crawler.arun(
            url = f'raw:{result}',
            config=crawl_config
        )
        
        if result.success:
            # 5. The extracted content is presumably JSON
            data = json.loads(result.extracted_content)
            print("Extracted items:", data)

            # 6. Show usage stats
            llm_strategy.show_usage()  # prints token usage
        else:
            print("Error:", result.error_message)

if __name__ == "__main__":
    asyncio.run(main())
