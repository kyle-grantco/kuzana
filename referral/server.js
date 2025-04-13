const express = require('express');
const app = express();

app.get('/:referralName', (req, res) => {
    const referralName = req.params.referralName;
    const googleFormURL = 'https://docs.google.com/forms/d/e/your-form-id/viewform';
    const prefillURL = `${googleFormURL}?entry.123456=${referralName}`;
    res.redirect(prefillURL);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});