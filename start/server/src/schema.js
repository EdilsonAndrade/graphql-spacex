const { gql } = require('apollo-server');
const typeDefs = gql`
# the exclamation point means, this field's value can never be null
type Launch{
    id: ID!
    site:String
    mission:Mission
    rocket:Rocket
    isBooked: Boolean!
}
type Rocket{
  id: ID!
  name: String 
  type: String 
}
type User{
  id:ID! 
  email:String! 
  trips: [Launch]! #THIS FIELS IS AN ARRAY TYPE AND CANNOT BE NULL AS WE HAVE HERE THE EXCLAMATION POINT.
  token: String
}
type Mission{
  name: String 
  missionPatch(size: PatchSize): String
}

enum PatchSize{
    SMALL,
    LARGE
}
type Query{
  launches: [Launch]! 
  launch(id:ID!): Launch 
  me:User
}
type Mutation{
  bookTrip(launchIds:[ID]!): TripUpdateResponse!  #here passing [ID]! mean that is obligate at least one id of launch or more
  cancelTrip(launchId: ID!): TripUpdateResponse! 
  login(email:String): User
}
type TripUpdateResponse{
  success: Boolean! 
  message: String 
  launches: [Launch]
}
`

module.exports = typeDefs;