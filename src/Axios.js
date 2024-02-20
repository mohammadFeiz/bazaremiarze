import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import { Navigate, useNavigate } from 'react-router-dom';

const instance = axios.create({
    baseURL: 'https://retailerapp.bbeta.ir/api/',
    // timeout: 1000,
    headers: { 'Content-Type': 'application/json' }
});

instance.interceptors.request.use(
    function (config) {
        // Do something before request is sent
        if (localStorage.getItem('token')) {
            config.headers.Authorization = 'Bearer ' + localStorage.getItem('token');
        }
        return config;
    },
    function (error) {
        // Do something with request error
        return Promise.reject(error);
    }
);

instance.interceptors.response.use(
    function (response) {
        console.log(response);
        return response;
    },
    function (err) {
        // System log
        console.log(err);
        console.log(
            toast.error(err.response.data.message, {
                position: toast.POSITION.BOTTOM_RIGHT,
                rtl: true
            })
        );
        // let navigate = useNavigate();

        if (err.response.data.code == 400) {
            toast.error(err.response.data.message, {
                position: toast.POSITION.BOTTOM_RIGHT,
                rtl: true
            });
            localStorage.clear();
            // navigate(`/login`, { replace: true });
        } else if (err.response.data.code == 401) {
            toast.error(err.response.data.message, {
                position: toast.POSITION.BOTTOM_RIGHT,
                rtl: true
            });
            localStorage.clear();
            // navigate(`/login`, { replace: true });
        } else if (err.response.data.code == 403) {
            toast.error(err.response.data.message, {
                position: toast.POSITION.BOTTOM_RIGHT,
                rtl: true
            });
            localStorage.clear();
            // navigate(`/login`, { replace: true });
        } else {
            toast.error(err.response.data.message, {
                position: toast.POSITION.BOTTOM_RIGHT,
                rtl: true
            });
            localStorage.clear();
            // navigate(`/login`, { replace: true });
        }
        window.location.href = '/login';
        // window.location.reload();
        return Promise.reject(err);
    }
);

export default instance;
