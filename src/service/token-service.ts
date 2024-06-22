interface JettonData {
  name: string;
  symbol: string;
  image: string;
  description: string;
  decimals: string;
}

export const fetchData = async (
  tokenUri: string
): Promise<JettonData | null> => {
  try {
    const response = await fetch(tokenUri);

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const res: JettonData = await response.json();
    return res;
  } catch (error) {
    console.error("Fetch data failed:", error);
    return null;
  }
};
