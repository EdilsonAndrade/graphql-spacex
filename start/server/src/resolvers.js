const { paginateResults } = require("./utils");

module.exports = {
  Query: {
    launches: async (_, {pageSize=20, after}, { dataSources }) =>{
      const allLaunches = await dataSources.launchAPI.getAllLaunches();
      allLaunches.reverse();
      const launches = paginateResults({
        after,
        pageSize,
        results:allLaunches
      });
      return {
        launches,
        cursor: launches.length ? launches[launches.length - 1].cursor : null,
        // if the cursor at the end of the paginated results is the same as the
        // last item in _all_ results, then there are no more results after this
        hasMore: launches.length
          ? launches[launches.length - 1].cursor !==
            allLaunches[allLaunches.length - 1].cursor
          : false
      };
    },
    launch: (_, { id }, { dataSources }) =>
      dataSources.launchAPI.getLaunchById({ launchId: id }),
    me: (_, __, { dataSources }) => dataSources.userAPI.findOrCreateUser()
  },
  Mission: {
    missionPatch: (mission, { size } = { size: 'LARGE' }) => {
      return size === 'SMALL'
        ? mission.missionPatchSmall
        : mission.missionPatchLarge;
    }
  },
  Launch: {
    isBooked: async (launch, _, { dataSources }) =>
      dataSources.userAPI.isBookedOnLaunch({ launchId: launch.id }),
      vacinou: (launch,_,{dataSources})=>{
        return true
      }
    
  },
 
  User: {
    trips: async (_, __, { dataSources }) => {
      // get ids of launches by user
      const launchIds = await dataSources.userAPI.getLaunchIdsByUser();
      if (!launchIds.length) return [];
      // look up those launches by their ids
      return (
        dataSources.launchAPI.getLaunchesByIds({
          launchIds,
        }) || []
      );
    },
  },
  Mutation:{
    login: async (_, {email}, {dataSources})=>{
      const user = await dataSources.userAPI.findOrCreateUser({email});
      if(user){
        user.totken = Buffer.from(email).toString('base64');
        
        return user;
      }
    },
    bookTrip: async (_, {launchId}, {dataSource})=>{
      const results =  await dataSource.userAPI.bookTrip({launchId});

      const launches = await dataSource.launchAPI.getLaunchesByIds({launchId});

      return{
        success: results && results.length === launchIds.length,
        message:
          results.length === launchIds.length
            ? 'trips booked successfully'
            : `the following launches couldn't be booked: ${launchIds.filter(
                id => !results.includes(id),
              )}`,
        launches,
      }
    },
    cancelTrip: async (_, {launchId}, {dataSource})=>{
      const result = await dataSource.userAPI.cancelTrip({launchId});
      const launch = await dataSource.launchAPI.getLaunchById({launchId});

      if(!result){
        return{
          success:false,
          message: 'failed to cancel trip'
        }
      }

      return {
        success: true,
        message: 'Your trip was cancelled',
        launches:[launch]
      }

    }

  }

};