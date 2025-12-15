"use client"

const isAuthenticated = async () => {
    // my access tooken in local storage
    // my refresh token in cookies 
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) return true;
};

export { isAuthenticated };