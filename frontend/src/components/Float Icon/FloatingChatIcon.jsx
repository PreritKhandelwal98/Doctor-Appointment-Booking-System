import { useState } from 'react';
import { FaComments } from 'react-icons/fa';
import Modal from 'react-modal';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BASE_URL } from './../../utils/config';
import HashLoader from 'react-spinners/HashLoader';

Modal.setAppElement('#root');

const FloatingChatIcon = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setChatMessages([]);
    setPrompt('');
  };

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };

  const handlePromptSubmit = async (e) => {
    e.preventDefault();
    if (prompt.trim() === '') return;

    const newMessage = { type: 'user', text: prompt };
    setChatMessages([...chatMessages, newMessage]);
    setPrompt('');
    setIsLoading(true);

    try {
      const res = await axios.post(`${BASE_URL}/ai/prompt`, { prompt });
      const aiResponse = { type: 'ai', text: res.data.response };
      setChatMessages((prevMessages) => [...prevMessages, aiResponse]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      toast.error("Error fetching AI response");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
          cursor: 'pointer',
          backgroundColor: '#0066ff',
          padding: '10px',
          borderRadius: '50%',
        }}
        onClick={openModal}
      >
        <FaComments color="#fff" size={30} />
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            padding: '0',
            border: 'none',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            maxWidth: '570px',
            width: '100%',
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
        }}
      >
        <section className="px-5 lg:px-0">
          <div className="w-full max-w-[570px] mx-auto rounded-lg shadow-md md:p-10">
            <h3 className="text-headingColor text-[22px] leading-9 font-bold mb-4">
              Chat with AI
            </h3>
            <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ddd', maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
              {chatMessages.map((message, index) => (
                <div key={index} style={{ margin: '10px 0' }}>
                  <strong>{message.type === 'user' ? 'You: ' : 'AI: '}</strong>
                  <span>{message.text}</span>
                </div>
              ))}
              {isLoading && <div><HashLoader/>Generating response...</div>}
            </div>
            <form className="py-4 md:py-0" onSubmit={handlePromptSubmit}>
              <div className="mb-5">
                <input
                  type="text"
                  placeholder="Enter your prompt"
                  value={prompt}
                  onChange={handlePromptChange}
                  className="w-full px-4 py-3 border-b border-solid border-[#0066ff61] focus:outline-none focus:border-b-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor cursor-pointer"
                  required
                />
              </div>

              <div className="flex justify-between mt-2">
                <button
                  className="bg-gray-400 text-white text-[14px] leading-[24px] rounded px-4 py-2"
                  type="button"
                  onClick={closeModal}
                >
                  Close
                </button>
                <button
                  className="bg-primaryColor text-white text-[14px] leading-[24px] rounded px-4 py-2"
                  type="submit"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </section>
      </Modal>
    </>
  );
};

export default FloatingChatIcon;
