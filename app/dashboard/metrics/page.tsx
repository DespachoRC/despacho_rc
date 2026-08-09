export default function Metrics() {
    return(
        <div className="w-full h-full grid gap-2 grid-cols-3 grid-rows-[60_1fr_2fr]">
            <div className="col-span-3 flex items-center">
                <h1 className="xl:text-xl font-semibold">Métricas</h1>
            </div>
            <div className="bg-gray border-dark-gray rounded-2xl"></div>
            <div className="bg-gray border-dark-gray rounded-2xl"></div>
            <div className="bg-gray border-dark-gray rounded-2xl"></div>
            <div className="col-span-3 bg-gray border-dark-gray rounded-2xl"></div>
        </div>
    );
}