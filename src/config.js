
import axios from "axios";
// import { findWhere } from "underscore";
const baseURL = "https://hyvn-api-production-66db.up.railway.app"
// const tinyAPIKey = process.env.TINY_API_KEY;

async function parseResponseBody(response) {
  if (response?.status === 401) {
    localStorage.removeItem("user_id");
    localStorage.removeItem("email");
    localStorage.removeItem("token");
    if (window.location.pathname !== "/") window.location.href = "/";
    return null;
  }
  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }
  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      (typeof data === "string" ? data : `Request failed with status ${response.status}`);
    const err = new Error(message);
    err.status = response.status;
    err.data = data;
    throw err;
  }
  return data;
}

const config = {
  baseURL,
  // tinyAPIKey,
  getAPI(data) {
    return new Promise((resolve, reject) => {
      var retrievedObject = localStorage.getItem("token");
      let url = new URL(`${baseURL}${data.url}`);
      url.search = new URLSearchParams({
        ...data.params,
        lang_code: "EN",
      }).toString();
      fetch(url, {
        headers: {
          Authorization: retrievedObject ? `Bearer ${retrievedObject}` : "",
        },
      })
        .then((response) => parseResponseBody(response))
        .then((data) => {
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  postAPI(data) {
    return new Promise((resolve, reject) => {
      var retrievedObject = localStorage.getItem("token");
      fetch(`${baseURL}${data.url}`, {
        method: "post",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: retrievedObject ? `Bearer ${retrievedObject}` : "",
        },
        body: JSON.stringify({ ...data.params, lang_code: "EN" }),
      })
        .then((response) => parseResponseBody(response))
        .then((data) => {
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  allAPI(data) {
    return new Promise((resolve, reject) => {
      var retrievedObject = localStorage.getItem("token");
      fetch(`${baseURL}${data.url}`, {
        method: data.method ? data.method : "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: retrievedObject ? `Bearer ${retrievedObject}` : "",
        },
        body: JSON.stringify({ ...data.params, lang_code: "EN" }),
      })
        .then((response) => parseResponseBody(response))
        .then((data) => {
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  postFormDataAPI(data) {
    return new Promise((resolve, reject) => {
      var retrievedObject = localStorage.getItem("token");
      fetch(`${baseURL}${data.url}`, {
        method: "post",
        headers: {
          contentType: "application/json",
          Authorization: retrievedObject ? `Bearer ${retrievedObject}` : "",
        },
        body: data.params,
      })
        .then((response) => parseResponseBody(response))
        .then((data) => {
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  putFormDataAPI(data) {
    return new Promise((resolve, reject) => {
      // var retrievedObject = localStorage.getItem("token");
      fetch(`${baseURL}${data.url}`, {
        method: "put",
        headers: {
          contentType: "application/json",
          // Authorization: retrievedObject ? `Bearer ${retrievedObject}` : "",
        },
        body: data.params,
      })
        .then((response) => parseResponseBody(response))
        .then((data) => {
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  getAPIaxios(data) {
    return new Promise(async (resolve, reject) => {
      try {
        var retrievedObject = localStorage.getItem("token");
        let result = await axios.get(`${baseURL}${data.url}`, {
          params: { ...data.params, code: "EN" },
          headers: { Authorization: retrievedObject ? `Bearer ${retrievedObject}` : "" },
        });
        console.log(result, "result");

        resolve(result?.data?.payload || result?.data?.data || result?.data);
        return;
      } catch (error) {
        if (error?.response?.status === 401) {
          localStorage.removeItem("user_id");
          localStorage.removeItem("email");
          localStorage.removeItem("token");
          if (window.location.pathname !== "/") window.location.href = "/";
        }
        reject(error);
        return;
        // throw error;
      }
    });
  },
  
  postAPIaxios(data) {
    return new Promise(async (resolve, reject) => {
      try {
        const retrievedObject = localStorage.getItem("token");
        // For POST requests, the payload is the second argument
        const result = await axios.post(`${baseURL}${data.url}`, data.data, {
          headers: { Authorization: retrievedObject ? `Bearer ${retrievedObject}` : "" },
        });
        // Assuming the successful response is also in result.data.payload
        resolve(result?.data?.payload);
        return;
      } catch (error) {
        if (error?.response?.status === 401) {
          localStorage.removeItem("user_id");
          localStorage.removeItem("email");
          localStorage.removeItem("token");
          if (window.location.pathname !== "/") window.location.href = "/";
        }
        // Reject with the error response from the server for better debugging
        reject(error.response?.data || error);
        return;
      }
    });
  },

//   accessRight(code, flag = "") {
//     try {
//       const rightsData = JSON.parse(localStorage.getItem("rightsData"));
//       const whereFind = findWhere(rightsData, { code: code });
//       return whereFind?.data;
//     } catch (error) {
//       throw error;
//     }
//   }
};

export default config;
