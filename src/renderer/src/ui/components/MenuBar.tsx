import appIcon from '../../assets/icons/ico.ico';

export default function MenuBar() {
  const buttonStyle: React.CSSProperties & { WebkitAppRegion?: string } = {
    WebkitAppRegion: "no-drag",
    cursor: "pointer",
  };

  return (
    <div
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties & { WebkitAppRegion?: string }}
      className="flex items-center justify-between h-8 px-3 bg-gray-900 text-white select-none relative drag">
      <div className="absolute right-3 flex gap-2 no-drag">
        <button
          style={buttonStyle}
          className="w-3 h-3 rounded-full bg-[#ffbd44] hover:brightness-90"
          onClick={() => window.api.minimize()}
        />
        <button
          style={buttonStyle}
          className="w-3 h-3 rounded-full bg-[#00ca56] hover:brightness-90"
          onClick={() => window.api.maximize()}
        />
        <button
          style={buttonStyle}
          className="w-3 h-3 rounded-full bg-[#ff605c] hover:brightness-90"
          onClick={() => window.api.close()}
        />
      </div>

      <div className="text-xs font-medium pointer-events-none left-3 flex items-center align-middle gap-2">
        <img
          src={appIcon}
          alt="App Icon"
          className="w-7 h-7 object-contain"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        />
        Giligans Reconciliation
      </div>
    </div>
  );
}
