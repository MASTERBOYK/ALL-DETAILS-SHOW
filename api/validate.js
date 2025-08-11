export default async function handler(req, res) {
    const { email } = req.query;
    const apiKey = process.env.ABSTRACT_API_KEY;

    try {
        const apiResponse = await fetch(`https://emailvalidation.abstractapi.com/v1/?api_key=${apiKey}&email=${email}`);
        const data = await apiResponse.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "API request failed" });
    }
}