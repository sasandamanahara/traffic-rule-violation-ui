export default {
  name: 'camera',
  title: 'Camera',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Camera Name',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'location',
      title: 'Location',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'coordinates',
      title: 'Coordinates',
      type: 'object',
      fields: [
        {
          name: 'lat',
          title: 'Latitude',
          type: 'number'
        },
        {
          name: 'lng',
          title: 'Longitude',
          type: 'number'
        }
      ]
    },
    {
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      initialValue: true
    },
    {
      name: 'violationTypes',
      title: 'Detection Types',
      type: 'array',
      of: [
        {
          type: 'string',
          options: {
            list: [
              {title: 'Vehicle Type', value: 'vehicleType'},
              {title: 'Number Plate', value: 'numberPlate'},
              {title: 'Triple Riding', value: 'tripleRiding'},
              {title: 'Helmet', value: 'helmet'},
              {title: 'Speed Limit', value: 'speedLimit'},
              {title: 'Red Light', value: 'redLight'},
              {title: 'Illegal Parking', value: 'illegalParking'}
            ]
          }
        }
      ]
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text'
    },
    {
      name: 'lastMaintenance',
      title: 'Last Maintenance',
      type: 'datetime'
    }
  ],
  preview: {
    select: {
      title: 'name',
      location: 'location',
      isActive: 'isActive'
    },
    prepare(selection) {
      const {title, location, isActive} = selection
      return {
        title: title,
        subtitle: `${location} - ${isActive ? 'Active' : 'Inactive'}`
      }
    }
  }
} 