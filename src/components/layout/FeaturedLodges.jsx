import LodgeItem from "../ui/LodgeItem";

const FeaturedLodges = () => {
    return (
        <section className='bg-primary-light'>
            <div className="container py-20">
                <div className='text-center'>
                    <h2 className='font-semibold heading-responsive'>Featured Lodges</h2>
                </div>

                {/* Lodges preview  */}
                <div className="mt-8 md:mt-12">
                    {/* lodge items */}
                    <LodgeItem />
                </div>
            </div>
        </section>
    )
}

export default FeaturedLodges