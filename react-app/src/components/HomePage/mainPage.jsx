import React, { useState, useEffect } from 'react';
import axios from 'axios';
import axiosInstance from '../axiosInstance';
import { useNavigate } from "react-router-dom";

function EBanking() {
  const [tranzactiiUserOUT, setTranzactiiUserOUT] = useState([]);
  const [tranzactiiUserIN, setTranzactiiUserIN] = useState([]);
  const [userID, setUserID] = useState('');
  const [userName, setUserName] = useState([]);
  const [cont, setCont] = useState({});
  const [sold, setSold] = useState('')
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [ibanSursa, setIbanSursa] = useState('');
  const [ibanDestinatie, setIbanDestinatie] = useState('');
  const [suma, setSuma] = useState('');
  const [IDTransfer, setIDTransfer] = useState('');
  const [action, setAction] = useState('');
 const navigate = useNavigate();
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    axiosInstance.get('/mainPage')
      .then(response => {
        setTranzactiiUserOUT(response.data.tranzactiiUserOUT);
        setTranzactiiUserIN(response.data.tranzactiiUserIN);
        setUserID(response.data.USERID);
        setUserName(response.data.NAME);
        setCont(response.data.CONT);
        setSold(cont.sold)
        if (response.data.CONT && response.data.CONT.iban) {
          setIbanSursa(response.data.CONT.iban);
        }
      })
      .catch(err => {
        setError('Error fetching transaction data');
        console.error(err);
      });
  };


  const handleTransfer = async (e) => {
    e.preventDefault();
    try {
      console.log("ibanSursa:", ibanSursa);
      console.log("UserID", userID);
      const response = await axiosInstance.post('/transferConturi', {ibanDestinatie, suma: parseInt(suma,10), ibanSursa, userID: parseInt(userID,10) });
      await fetchTransactions();
      setSold(cont.sold)
      console.log("soldul este", cont.sold);
      //await fetchAccountData();
      setSuccessMessage(response.data.message);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Error during transfer');
      setSuccessMessage(null);
    }
  };

  const handleTransferAction = async (e, IDTransfer, action) => {
    e.preventDefault();
    try{
    axiosInstance.post('/finalizareTransfer', {
      IDTransfer,
      action
    })
      .then(response => {
        setSuccessMessage(response.data.message);
        setError(null);
        fetchTransactions();
        setSold(cont.sold)
        //console.log("soldul este", cont.sold);
        //fetchAccountData();
      })
    } catch(err) {
        setError(err.response?.data?.error || 'Error processing transfer action');
        setSuccessMessage(null);
      };
  };

  const handleCancelTransfer = async (e, IDTransfer) => {
    e.preventDefault();
    try{
      axiosInstance.post('/cancelTransfer', { IDTransfer })
      .then(response => {
        setSuccessMessage(response.data.message);
        setError(null);
        fetchTransactions();
        setSold(cont.sold)
        //console.log("soldul este", cont.sold);
        //fetchAccountData();
      })
    } catch(err ) {
        setError(err.response?.data?.error || 'Error canceling transfer');
        setSuccessMessage(null);
      };
  };
  return (
    <div className="container">
      {/* User Info Section */}
      <div className="user-info">
        <h2>Hello {userName} cu id {userID}</h2>
        <p>Soldul contului este {cont.sold}</p>
        <p>Ibanul contului este {cont.iban}</p>
      </div>

      <form action="transferConturi" method="post">
        <input type="text" name="ibanDestinatie" placeholder="Iban Destinatie" value={ibanDestinatie} onChange={(e) => setIbanDestinatie(e.target.value)}/>
        <input type="text" name="suma" placeholder="Suma" value={suma} onChange={(e) => setSuma(e.target.value)}/>
        <input type="hidden" name="ibanSursa"  />
        <input type="hidden" name="userID"  />
        <button onClick={handleTransfer} type="submit" value="Transfer"> Transfer </button>
      </form>
      {error && <div className="error-message">{error}</div>}

      <div className="transactions">
        <h2>Tranzactii primite</h2>
        {tranzactiiUserOUT.length > 0 ? (
          tranzactiiUserOUT.map((transaction, index) => (
            <form key={index} action="finalizareTransfer" method="post">
              <div>
                <p>IBAN primire: {transaction.IBANtrimite}</p>
                <p>Suma: {transaction.sumaTransfer} RON</p>
                <p>Data: {transaction.dataTranzactiei}</p>
                <input type="hidden" name="IDTransfer" value={transaction.IDTransfer} />
                <button onClick={(e) => handleTransferAction(e, transaction.IDTransfer, 'accept')} type="submit" name="action" value="accept">Accepta bani</button>
                <button onClick={(e) => handleTransferAction(e, transaction.IDTransfer, 'reject')} type="submit" name="action" value="reject">Respinge transferul</button>
              </div>
            </form>
          ))
        ) : (
          <p>No incoming transactions.</p>
        )}
      </div>

      <div className="transactions">
        <h2>Tranzactii trimise</h2>
        {tranzactiiUserIN.length > 0 ? (
          tranzactiiUserIN.map((transaction, index) => (
            <form key={index} action="cancelTransfer" method="post">
                <div>
                    <p>IBAN trimitere: {transaction.IBANprimeste}</p>
                    <p>Suma: {transaction.sumaTransfer} RON</p>
                    <p>Data: {transaction.dataTranzactiei}</p>
                    <input type="hidden" name="IDTransfer" value={transaction.IDTransfer}/>
                    <button onClick={(e) => handleCancelTransfer(e, transaction.IDTransfer)} type="submit">Cancel
                    </button>
                </div>
            </form>
          ))
        ) : (
            <p>No outgoing transactions.</p>
        )}
      </div>
        <p className="mltipleacc-bottom-p">
            Vrei inca un cont? <a href="#" onClick={() => navigate('/viewMultipleAccounts')}>Creeaza</a>
        </p>
    </div>
  );
}

export default EBanking;
