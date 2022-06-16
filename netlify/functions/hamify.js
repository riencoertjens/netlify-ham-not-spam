const axios = require("axios");
require("dotenv").config();

const baseUrl = "https://api.netlify.com/api/v1";
const authHeader = "Bearer " + process.env.NETLIFY_API_TOKEN;
const headers = {
  "User-Agent": "Netlify spam checker (YOUR_NAME@EXAMPLE.COM)",
  Authorization: authHeader,
};

async function getFormIds() {
  const url = `${baseUrl}/sites/${process.env.FORM_SITE_ID}/forms`;
  console.log(url);
  return await axios
    .get(url, {
      headers: headers,
    })
    .then((res) => res.data.map((form) => form.id))
    .catch((err) => console.log({ err }));
}

async function clearSpam() {
  const formIds = await getFormIds();

  formIds.map(async (formId) => {
    console.log("checking", formId);

    return await axios
      .get(`${baseUrl}/forms/${formId}/submissions?state=spam`, {
        headers: headers,
      })
      .then((res) =>
        res.data.map(({ id, email }) => {
          const emailDomain = email.split("@")[1];
          if (process.env.EMAIL_WHITELIST.includes(emailDomain)) {
            hamNotSpam(id);
          }
        })
      )
      .catch((err) => console.log({ err }));
  });
}

async function hamNotSpam(id) {
  await axios
    .put(`${baseUrl}/submissions/${id}/ham`, {}, { headers: headers })
    .catch((err) => console.log({ err }));
}

exports.handler = function () {
  clearSpam();
  console.log("test");

  return {
    statusCode: 200,
  };
};
