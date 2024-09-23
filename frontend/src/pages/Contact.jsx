const Contact = () => {
  return (
    <section>
      <div className="px-4 mx-auto max-w-screen-md">
        <h2 className="heading text-center">Contact Us</h2>
        <p className="mb-8 lg:mb-16 font-light text-center text__para">
          Got a technical issue? Want to send feedback about a beta feature? Let us know
        </p>
        <form action="">
          <div className="mb-4">
            <label htmlFor="email" className="form__label mb-2">
              Your Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="example@gmail.com"
              className="form__input mt-2"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="subject" className="form__label mb-2">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              placeholder="Let us know how we can help you"
              className="form__input mt-2"
            />
          </div>

          <div className="mb-4 sm:col-span-2">
            <label htmlFor="message" className="form__label mb-2">
              Your Message
            </label>
            <textarea
              rows="5"
              id="message"
              placeholder="Leave a comment..."
              className="form__input mt-2"
            />
          </div>
          <button type="submit" className="btn rounded sm:w-fit">Submit</button>
        </form>
      </div>
    </section>
  )
}

export default Contact
