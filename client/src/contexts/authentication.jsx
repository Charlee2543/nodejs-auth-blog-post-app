import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AuthContext = React.createContext();

function AuthProvider(props) {
   const [state, setState] = useState({
      loading: null,
      error: null,
      user: null,
   });
   const navigate = useNavigate();

   const login = async (data) => {
      try {
         // 🐨 Todo: Exercise #4
         //  ให้เขียน Logic ของ Function `login` ตรงนี้
         //  Function `login` ทำหน้าที่สร้าง Request ไปที่ API POST /login
         //  ที่สร้างไว้ด้านบนพร้อมกับ Body ที่กำหนดไว้ในตารางที่ออกแบบไว้
         const result = await axios.post('http://localhost:4000/login', data);
         // console.log('data: ', data);
         const token = result.data.token;
         console.log('token: ', token);
         localStorage.setItem('token', token);
         const userDAtaFromToken = jwtDecode(token);
         console.log('userDAtaFromToken: ', userDAtaFromToken);
         navigate('/');
      } catch (error) {
         console.log(error);
      }
   };

   const register = async ({ username, firstName, lastName, password }) => {
      // 🐨 Todo: Exercise #2
      //  ให้เขียน Logic ของ Function `register` ตรงนี้
      //  Function register ทำหน้าที่สร้าง Request ไปที่ API POST /register
      //  ที่สร้างไว้ด้านบนพร้อมกับ Body ที่กำหนดไว้ในตารางที่ออกแบบไว้
      // ให้ส่งข้อมูลมา ด้วย post โดย ส่งข้อมูลไปด้วย object
      // console.log('dataUser :', username, firstName, lastName, password);
      try {
         if (username && firstName && lastName && password) {
            // console.log(
            //    'if dataUser :',
            //    username,
            //    firstName,
            //    lastName,
            //    password
            // );
            await axios.post('http://localhost:4000/register', {
               username,
               firstName,
               lastName,
               password,
            });
            navigate('/login');
         } else {
            console.log(
               'else dataUser :',
               username,
               firstName,
               lastName,
               password
            );
            alert('Please fill in all information.');
         }
      } catch (error) {
         console.log('register fasle ', error);
      }
   };

   const logout = () => {
      // 🐨 Todo: Exercise #7
      //  ให้เขียน Logic ของ Function `logout` ตรงนี้
      //  Function logout ทำหน้าที่ในการลบ JWT Token ออกจาก Local Storage
   };

   const isAuthenticated = Boolean(localStorage.getItem('token'));

   return (
      <AuthContext.Provider
         value={{ state, login, logout, register, isAuthenticated }}
      >
         {props.children}
      </AuthContext.Provider>
   );
}

// this is a hook that consume AuthContext
const useAuth = () => React.useContext(AuthContext);

export { AuthProvider, useAuth };
