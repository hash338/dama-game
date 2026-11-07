export default function Shell({ children }) {
  return (
    <>
      <div className="bg">
        <i className="blob b1" />
        <i className="blob b2" />
        <i className="blob b3" />
        <div className="grid-floor" />
      </div>
      <main className="app">{children}</main>
    </>
  )
}