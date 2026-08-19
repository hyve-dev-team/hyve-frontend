import axios from "axios";
// import { findWhere } from "underscore";
const baseURL =  "http://localhost:1909" // process.env.BASE_URL;
// const tinyAPIKey = process.env.TINY_API_KEY;

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
          Authorization: retrievedObject ? retrievedObject : "",
        },
      })
        .then((response) => {
          if (response?.status === 401) {
            localStorage.removeItem("user_id");
            localStorage.removeItem("email");
            localStorage.removeItem("token");
            if (window.location.pathname !== "/") window.location.href = "/";
            return;
          } else {
            return response.json();
          }
        })
        .then((data) => {
          resolve(data);
          return;
        })
        .catch((error) => {
          // console.log(error)
          reject(error);
          return;
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
          Authorization: retrievedObject ? retrievedObject : "",
        },
        body: JSON.stringify({ ...data.params, lang_code: "EN" }),
      })
        .then((response) => {
          if (response?.status === 401) {
            localStorage.removeItem("user_id");
            localStorage.removeItem("email");
            localStorage.removeItem("token");
            if (window.location.pathname !== "/") window.location.href = "/";
            return;
          } else {
            return response.json();
          }
        })
        .then((data) => {
          resolve(data);
          return;
        })
        .catch((error) => {
          // console.log(error)
          reject(error);
          return;
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
          Authorization: retrievedObject ? retrievedObject : "",
        },
        body: JSON.stringify({ ...data.params, lang_code: "EN" }),
      })
        .then((response) => {
          if (response?.status === 401) {
            localStorage.removeItem("user_id");
            localStorage.removeItem("email");
            localStorage.removeItem("token");
            if (window.location.pathname !== "/") window.location.href = "/";
            return;
          } else {
            return response.json();
          }
        })
        .then((data) => {
          resolve(data);
          return;
        })
        .catch((error) => {
          reject(error);
          return;
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
          Authorization: retrievedObject ? retrievedObject : "",
        },
        body: data.params,
      })
        .then((response) => {
          if (response?.status === 401) {
            localStorage.removeItem("user_id");
            localStorage.removeItem("email");
            localStorage.removeItem("token");
            if (window.location.pathname !== "/") window.location.href = "/";
            return;
          } else {
            return response.json();
          }
        })
        .then((data) => {
          resolve(data);
          return;
        })
        .catch((error) => {
          // console.log(error)
          reject(error);
          return;
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
          // Authorization: retrievedObject ? retrievedObject : "",
        },
        body: data.params,
      })
        .then((response) => {
          if (response?.status === 401) {
            localStorage.removeItem("user_id");
            localStorage.removeItem("email");
            localStorage.removeItem("token");
            // if (window.location.pathname !== "/") window.location.href = "/";
            return;
          } else {
            return response.json();
          }
        })
        .then((data) => {
          resolve(data);
          return;
        })
        .catch((error) => {
          // console.log(error)
          reject(error);
          return;
        });
    });
  },

  getAPIaxios(data) {
    return new Promise(async (resolve, reject) => {
      try {
        var retrievedObject = localStorage.getItem("token");
        let result = await axios.get(`${baseURL}${data.url}`, {
          params: { ...data.params, code: "EN" },
          headers: { Authorization: retrievedObject ? retrievedObject : "" },
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
          headers: { Authorization: retrievedObject ? retrievedObject : "" },
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
