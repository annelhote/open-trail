const Planner = ({ gpx }) => {
  return (
    <div className='planner'>
      <table>
        <tr>
          <th>Day</th>
          <th>Start</th>
          <th>End</th>
          <th>Distance</th>
          <th>Night solution</th>
        </tr>
        <tr>
          <td>1</td>
          <td>0</td>
          <td>0</td>
          <td></td>
          <td>Auberge de Léoncel</td>
        </tr>
      </table>
    </div>
  );
};

export default Planner;
