import React, { useEffect, useState, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import "regenerator-runtime/runtime";
import { useFormik } from 'formik';
import Big from "big.js";
// Assets
import logo from './link3_logo.svg';
import nearLogo from './near_logo.svg';
import githubLogo from './github_logo.svg';
import copyicon from './copy_icon.svg';



const BOATLOAD_OF_GAS = Big(3).times(10 ** 13).toFixed();

const App = ({ contract, currentUser, nearConfig, wallet }) => {
  // useState
  const [isSignInLoading, setIsSignInLoading] = useState(false)
  const [userLink3, setUserLink3] = useState(null);
  const [otherLink3, setOtherLink3] = useState(null);
  const [isUserLink3Loaded, setIsUserLink3Loaded] = useState(false)
  const [isCreateLinkLoading, setIsCreateLinkLoading] = useState(false)
  // Actions
  const fetchUserLink3 = useCallback(async () => {
    if (currentUser) {
      const link3 = await contract.get({ account_id: currentUser.accountId });
      setUserLink3(link3)
      setIsUserLink3Loaded(true)
    }
  }, [currentUser, contract]);

  const fetchOtherLink3 = useCallback(async () => {
    if (currentUser) {
      const accountId = window.location.pathname.slice(1)
      const link3 = await contract.get({ account_id: accountId });
      if (link3) {
        setOtherLink3(link3)
      }
      console.log('accountId: ', accountId)
      console.log('setOtherLink3: ', link3)
    }
  }, [currentUser, contract]);

  const signIn = () => {
    setIsSignInLoading(true)
    wallet.requestSignIn(nearConfig.contractName, "Link3 Testnet");
  };

  const signOut = () => {
    setIsSignInLoading(true)
    wallet.signOut();
    window.location.replace(window.location.origin + window.location.pathname);
    setIsSignInLoading(false)
  };

  const toHome = () => {
    if (window.location.pathname !== '/') {
      window.location = '/'
    }
  }

  const copyText = () => {
    toast.success('Copied to clipboard')
    navigator.clipboard.writeText(window.location.host + '/' + currentUser.accountId)
  }

  // useEffects
  useEffect(() => {
    if (window.location.pathname !== '/') {
      fetchOtherLink3()
    }
    fetchUserLink3()
    setIsSignInLoading(false)
  }, [currentUser, setIsSignInLoading, fetchUserLink3, fetchOtherLink3])

  // Render Methods
  const renderLoggedOutContainer = () => {
    return (
      <div className="mt-20 text-center flex flex-col justify-center items-center text-white space-y-8 bt-red-500">
        <header className="space-y-6">
          <img src={logo} className='h-80 mx-auto rounded-full' alt="NEAR" />
          <h1 className="text-6xl">Welcome to Link3</h1>
          <p className="text-md">
            a linktree alternative built on <a className="underline" href="https://near.org">NEAR</a>.
          </p>
        </header>

        <button onClick={signIn}
          className="flex items-center space-x-1 bg-pink-500 ease-in-out transform duration-700 hover:bg-pink-300 px-8 py-2 rounded-lg font-bold"
        >
          Login with NEAR
          <img src={nearLogo}
            className={`h-6 ${isSignInLoading ? "animate-spin" : ""}`} alt="NEAR loading" />
        </button>

        <div>
          <p className="font-bold">Login to create and share your link3</p>
        </div>
      </div>
    )
  }

  const renderCreateUserLink3Container = () => {
    return (
      <div className="px-4 lg:px-0 pt-12">
        <p className='text-center text-4xl font-bold mb-8'>Let's start by creating your Link3 profile</p>
        {CreateLink3Form()}
      </div>
    )
  }

  const renderUserLink3Container = () => {
    return (
      <div className="lg:flex lg:px-2 xl:px-0 px-4 pt-10 w-full  justify-around space-y-8 lg:space-y-0 lg:space-x-8">
        <div className='w-full max-w-xl '>
          <div className="p-4 text-white text-center rounded-lg border">
            <img src={userLink3.image_uri} className="mx-auto h-20 w-20 object-cover rounded-full" alt="Link3" />
            <p className="mt-2 text-2xl font-bold">{userLink3.title}</p>
            <p className="text-xl">{userLink3.description}</p>
            <p className="mt-2 text-lg font-bold">{userLink3.owner}</p>
            {(userLink3.links.length > 0) ?
              <div className="mt-8 space-y-4 flex flex-col">
                {userLink3.links.map(item => (
                  <a key={item.id} href={item.uri} className="border-2 font-bold py-4 rounded-md transform duration-500 ease-in-out hover:bg-white hover:text-gray-800">
                    {item.image_uri && item.image_uri.length > 0 && <img className='bg-white rounded-full mx-auto w-6 h-6' src={item.image_uri} alt="Item" />}
                    <p>{item.title}</p>
                    <p className="text-xs">{item.description}</p>
                  </a>
                ))}
              </div> : <p className="mt-10 px-8 py-8 bg-gray-700 rounded-lg">Wow such empty 🐶<br />Start by creating a new link.</p>
            }
          </div>
          <div className='mt-4 px-8 lg:px-0'>
            <p className='text-center mb-2 font-semibold'>Share your link3</p>

            <p className='flex space-x-4  justify-center items-center pr-8 pl-12 py-4 rounded-lg bg-gray-400 text-gray-800 font-bold text-center'>
              <span>{window.location.host}/{currentUser.accountId}</span>
              <img
                src={copyicon}
                alt="Copy to clipboard"
                className='h-4 w-4 cursor-pointer'
                onClick={copyText} />
            </p>
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg px-8 py-4 space-y-4 max-w-xl w-full">
          <h3 className="text-center font-semibold text-lg">Create a link</h3>
          {CreateLinkForm()}
        </div>
      </div>
    )
  }

  const formikLink3 = useFormik({
    initialValues: {
      title: "",
      description: "",
      image_uri: "",
      is_published: true,
    },

    onSubmit: async values => {
      try {
        if (isCreateLinkLoading) {
          return;
        }
        const createPromise = contract.create(values, BOATLOAD_OF_GAS)
        setIsCreateLinkLoading(true)
        await toast.promise(createPromise,
          {
            loading: 'Creating...',
            success: <b>Link3 created!</b>,
            error: <b>Could not create.</b>,
          }
        );
        setIsCreateLinkLoading(false)
        fetchUserLink3()
        formik.resetForm()
      } catch (e) {
        console.log('Failed to create toast ', e)
        setIsCreateLinkLoading(false)
      }
    },
  });

  const CreateLink3Form = () => {
    return (
      <form className="max-w-2xl w-full mx-auto shadow-xl bg-gray-700 px-8 py-4 rounded-lg flex flex-col" onSubmit={formikLink3.handleSubmit}>
        <label
          className="mt-2 block text-white text-sm font-bold mb-2"
          htmlFor="title">Title</label>
        <input
          className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
          id="title"
          name="title"
          type="text"
          onChange={formikLink3.handleChange}
          value={formikLink3.values.title}
        />

        <label
          className="mt-2 block text-white text-sm font-bold mb-2"
          htmlFor="description">Description</label>
        <input
          className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
          id="description"
          name="description"
          type="text"
          onChange={formikLink3.handleChange}
          value={formikLink3.values.description}
        />

        <label
          className="mt-2 block text-white text-sm font-bold mb-2"
          htmlFor="image_uri">Profile pic URL</label>
        <input
          className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
          id="image_uri"
          name="image_uri"
          type="link"
          onChange={formikLink3.handleChange}
          value={formikLink3.values.image_uri}
        />

        {/* <div className="mt-4 pb-4 border-b flex space-x-2 items-center">
          <label
            className="cursor-pointer  block text-white text-sm font-bold"
            htmlFor="is_published">Published</label>
          <input
            className='cursor-pointer '
            id="is_published"
            name="is_published"
            type="checkbox"
            onChange={formik.handleChange}
            value={formik.values.is_published}
          />
        </div> */}


        <button type="submit"
          className={`${isCreateLinkLoading ? "bg-gray-500 cursor-not-allowed" : "bg-pink-500  hover:bg-pink-300"} mt-6 flex items-center justify-center space-x-1 ease-in-out transform duration-700 px-8 py-4 rounded-lg font-bold`}
        >
          <p>Create</p>
          <img src={nearLogo}
            className={`h-6 ${isCreateLinkLoading ? "animate-spin" : ""}`} alt="NEAR loading" />
        </button>
      </form>
    );
  };

  const formik = useFormik({
    initialValues: {
      uri: "",
      title: "",
      description: "",
      image_uri: "",
      is_published: true,
    },

    onSubmit: async values => {
      if (isCreateLinkLoading) {
        return;
      }
      const createPromise = contract.add_link(values, BOATLOAD_OF_GAS)
      setIsCreateLinkLoading(true)
      await toast.promise(createPromise,
        {
          loading: 'Creating...',
          success: <b>Link created!</b>,
          error: <b>Could not create link.</b>,
        }
      );
      setIsCreateLinkLoading(false)
      fetchUserLink3()
      formik.resetForm()
    },
  });

  const CreateLinkForm = () => {
    return (
      <form className="flex flex-col" onSubmit={formik.handleSubmit}>
        <label
          className="block text-white text-sm font-bold mb-2"
          htmlFor="uri">URL</label>
        <input
          className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
          id="uri"
          name="uri"
          type="link"
          onChange={formik.handleChange}
          value={formik.values.uri}
        />

        <label
          className="mt-2 block text-white text-sm font-bold mb-2"
          htmlFor="title">Title</label>
        <input
          className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
          id="title"
          name="title"
          type="text"
          onChange={formik.handleChange}
          value={formik.values.title}
        />

        <label
          className="mt-2 block text-white text-sm font-bold mb-2"
          htmlFor="description">Description</label>
        <input
          className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
          id="description"
          name="description"
          type="text"
          onChange={formik.handleChange}
          value={formik.values.description}
        />

        <label
          className="mt-2 block text-white text-sm font-bold mb-2"
          htmlFor="image_uri">Image URL</label>
        <input
          className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
          id="image_uri"
          name="image_uri"
          type="link"
          onChange={formik.handleChange}
          value={formik.values.image_uri}
        />

        {/* <div className="mt-4 pb-4 border-b flex space-x-2 items-center">
          <label
            className="cursor-pointer  block text-white text-sm font-bold"
            htmlFor="is_published">Published</label>
          <input
            className='cursor-pointer '
            id="is_published"
            name="is_published"
            type="checkbox"
            onChange={formik.handleChange}
            value={formik.values.is_published}
          />
        </div> */}


        <button type="submit"
          className={`${isCreateLinkLoading ? "bg-gray-500 cursor-not-allowed" : "bg-pink-500  hover:bg-pink-300"} mt-6 flex items-center justify-center space-x-1 ease-in-out transform duration-700 px-8 py-4 rounded-lg font-bold`}
        >
          <p className={`${isCreateLinkLoading ? "hidden" : "block"}`}>Create</p>
          <img src={nearLogo}
            className={`h-6 ${isCreateLinkLoading ? "animate-spin" : ""}`} alt="NEAR loading" />
        </button>
      </form>
    );
  };

  const renderSubPath = () => {
    return (
      <div className='w-full px-4 lg:px-0 pt-16'>
        <div className="mx-auto w-full max-w-xl p-4 text-white text-center rounded-lg border">
          <img src={otherLink3.image_uri} className="mx-auto h-20 w-20 object-cover rounded-full" alt="Link3" />
          <p className="mt-2 text-2xl font-bold">{otherLink3.title}</p>
          <p className="text-xl">{otherLink3.description}</p>
          <p className="mt-2 text-lg font-bold">{otherLink3.owner}</p>
          {(otherLink3.links.length > 0) ?
            <div className="mt-8 space-y-4 flex flex-col">
              {otherLink3.links.map(item => (
                <a key={item.id} href={item.uri} className="border-2 font-bold py-4 rounded-md transform duration-500 ease-in-out hover:bg-white hover:text-gray-800">
                  {item.image_uri && item.image_uri.length > 0 && <img className='bg-white rounded-full mx-auto w-6 h-6' src={item.image_uri} alt="Item" />}
                  <p>{item.title}</p>
                  <p className="text-xs">{item.description}</p>
                </a>
              ))}
            </div> : <p className="py-8">Wow such empty.</p>
          }
        </div>
        {!userLink3 &&
          <div className='mt-4 w-full flex justify-center items-center'>
            <button onClick={toHome} className='text-2xl px-4 py-2 border rounded-lg hover:bg-white hover:text-gray-800 transform ease-in-out duration-500'>create your link3</button>
          </div>
        }
      </div>
    )
  }

  const renderLoggedInContainer = () => {
    return (
      <div className=" text-white space-y-4">
        {/* NAVBAR_START */}
        <div className="px-4 py-4 shadow-xl flex items-center justify-between">
          <div className="flex items-center space-x-4">

            <img
              onClick={toHome}
              src={logo} className='cursor-pointer h-16 mx-auto rounded-full' alt="Link3" />
            <div><p className="text-3xl">Link3</p>
              <div className="hidden lg:block items-center justify-start text-xs">
                <p>Contract id ({nearConfig.networkId}):</p>
                <a
                  href={"https://explorer" + (nearConfig.networkId === 'mainnet' ? '' : "." + nearConfig.networkId) + ".near.org/accounts/" + contract.contractId}
                  className="underline">{contract.contractId}</a>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center space-y-1">
            {currentUser ? <p className="text-center font-bold text-md">{currentUser.accountId}</p> :
              <div class="h-3 animate-pulse w-full bg-gray-700 rounded"></div>
            }
            <button onClick={signOut} className="flex items-center space-x-1 bg-pink-500 ease-in-out transform duration-700 hover:bg-pink-300 px-8 py-2 rounded-lg font-bold">
              Disconnect
              <img src={nearLogo} className={`h-6 ${isSignInLoading ? "animate-spin" : ""}`} alt="NEAR loading" />
            </button>
          </div>
        </div>
        {/* NAVBAR_END */}
        {window.location.pathname === '/' ?
          isUserLink3Loaded ? userLink3 ? renderUserLink3Container() : renderCreateUserLink3Container() :
            <div className="mx-auto">
              <img src={nearLogo} className='mt-16 h-16 animate-spin mx-auto' alt="NEAR" />
            </div>
          : otherLink3 ? renderSubPath() :

            <div className='pt-12 text-center'>
              <p className='text-2xl'>Link3 for <span className='font-bold underline'>{window.location.pathname.slice(1)}</span> not found.</p>
              <button onClick={toHome} className='mt-8 text-lg underline'>to home</button>
            </div>
        }
      </div >
    )
  }

  // Hacky set title
  document.title = 'link3'
  return (
    <div className="bg-gray-800 min-h-screen flex flex-col justify-between text-white">
      <Toaster
        position="top-center"
        reverseOrder={false}
      />
      {currentUser ? renderLoggedInContainer() : renderLoggedOutContainer()}
      {/* Footer */}
      <div className="mt-20 mx-auto w-full text-center py-4 flex items-center justify-center space-x-2">
        <p className="text-sm">
          <span>by </span>
          <a
            className="underline"
            href="https://twitter.com/joaquimley"
          >
            @JoaquimLey
          </a>
        </p>

        <p>|</p>
        <p>joaquimley.near</p>
        <a href="https://github.com/JoaquimLey/link3">
          <img src={githubLogo} className="h-4" alt="GitHub" />
        </a>
      </div>
    </div>
  );
}
export default App;
