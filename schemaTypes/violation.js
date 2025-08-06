export default {
  name: 'violation',
  title: 'Traffic Violation',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Violation Title',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'type',
      title: 'Violation Type',
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
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'carId',
      title: 'Car ID',
      type: 'string'
    },
    {
      name: 'licensePlate',
      title: 'License Plate Number',
      type: 'string'
    },
    {
      name: 'location',
      title: 'Location',
      type: 'string'
    },
    {
      name: 'timestamp',
      title: 'Timestamp',
      type: 'datetime',
      validation: Rule => Rule.required()
    },
    {
      name: 'image',
      title: 'Violation Image',
      type: 'image',
      options: {
        hotspot: true
      }
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Pending', value: 'pending'},
          {title: 'Reviewed', value: 'reviewed'},
          {title: 'Approved', value: 'approved'},
          {title: 'Rejected', value: 'rejected'},
          {title: 'Paid', value: 'paid'}
        ]
      },
      initialValue: 'pending'
    },
    {
      name: 'fine',
      title: 'Fine Amount',
      type: 'number'
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text'
    },
    {
      name: 'detectedBy',
      title: 'Detected By',
      type: 'string',
      description: 'System or camera that detected the violation'
    }
  ],
  preview: {
    select: {
      title: 'title',
      type: 'type',
      timestamp: 'timestamp',
      status: 'status'
    },
    prepare(selection) {
      const {title, type, timestamp, status} = selection
      return {
        title: title || `${type} Violation`,
        subtitle: `${timestamp ? new Date(timestamp).toLocaleDateString() : 'No date'} - ${status || 'Pending'}`
      }
    }
  }
} 